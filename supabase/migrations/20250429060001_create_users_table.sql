-- ═══════════════════════════════════════════════════════════════════════════
--  CREATE TABLE  ▸  public.users
--  One row per application user, mapped 1-to-1 to auth.users.id
-- ═══════════════════════════════════════════════════════════════════════════

-- ensure uuid_generate_v4 is available (safe to run repeatedly)
create extension if not exists "uuid-ossp";

-- 1️⃣  If you're **renaming** the old recipients table, do that first
--     (comment this block out if you prefer to start clean).
-- --------------------------------------------------------------------------
-- alter table if exists public.recipients rename to users;
-- alter table public.users drop constraint if exists recipients_owner_fkey;
-- alter table public.users drop column if exists owner;

-- 2️⃣  Otherwise create a fresh table
-- --------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key        default uuid_generate_v4(),
  auth_id       uuid not null unique    references auth.users(id) on delete cascade,
  phone_e164    text not null unique,        -- "+919999888877"
  display_name  text not null default '',    -- many-to-one with auth.identities name
  avatar_url    text,                        -- optional
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- useful composite index for look-ups by phone
create index if not exists users_phone_idx on public.users (phone_e164);

-- 3️⃣  Row-level security: users may CRUD only *their* row
-- --------------------------------------------------------------------------
alter table public.users enable row level security;

create policy "Users can view their row"
  on public.users
  for select
  using ( auth.uid() = auth_id );

create policy "Users can insert/update their row"
  on public.users
  for all
  using  ( auth.uid() = auth_id )
  with check ( auth.uid() = auth_id );

-- 4️⃣  Trigger: keep `updated_at` fresh
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
  before update on public.users
  for each row
  execute procedure public.set_updated_at();

-- 5️⃣  (optional) drop the old helper table once you’ve migrated any data
-- --------------------------------------------------------------------------
-- drop table if exists public.recipients cascade;
