-- SQL for Supabase setup
create table if not exists public.coop_notifications (
  id uuid primary key default gen_random_uuid(),
  group_id text not null,
  group_name text not null,
  user_id uuid,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.coop_notifications enable row level security;

create policy "Allow read for all" on public.coop_notifications
  for select using (true);

create policy "Allow insert for authenticated" on public.coop_notifications
  for insert to authenticated with check (true);


