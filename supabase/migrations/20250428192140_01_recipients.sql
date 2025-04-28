-- 01_recipients.sql  ▸  supabase/migrations/20250429…

create table public.recipients (
  id            uuid primary key default uuid_generate_v4(),
  owner         uuid not null references auth.users on delete cascade,
  phone_e164    text not null,         -- "+918888888888"
  name          text not null,
  last_used_at  timestamptz default now()
);

-- each (owner, phone) pair unique
alter table public.recipients add constraint uniq_owner_phone unique (owner, phone_e164);

-- anyone can read / write only their own rows
create policy "owner can CRUD own recipients"
  on public.recipients
  for all
  using  ( auth.uid() = owner )
  with check ( auth.uid() = owner );
