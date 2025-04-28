-- stores every device-token the user logs in with
create table device_tokens (
  user_id uuid references auth.users on delete cascade,
  expo_token text,
  primary key (user_id, expo_token)
);

-- notifications you want to deliver
create table notifications (
  id bigint generated always as identity primary key,
  sender uuid references auth.users,
  recipient uuid references auth.users,
  title text,
  body  text,
  created_at timestamptz default now()
);

alter table device_tokens enable row level security;
alter table notifications enable row level security;

-- user may insert his own token
create policy "user adds token"
  on device_tokens for insert
  with check (auth.uid() = user_id);

-- user may insert a notification only for a recipient he’s allowed to greet
create policy "send pranaam"
  on notifications for insert
  with check (auth.uid() = sender);
