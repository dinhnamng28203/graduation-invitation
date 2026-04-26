-- Reset guest messages table and policies
drop table if exists public.guest_messages cascade;

create table public.guest_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 80),
  message text not null check (char_length(message) <= 500),
  created_at timestamptz not null default now()
);

alter table public.guest_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.guest_messages to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

create policy "public_can_insert_messages"
on public.guest_messages
as permissive
for insert
to anon, authenticated
with check (true);

create policy "no_public_select_messages"
on public.guest_messages
as permissive
for select
to anon, authenticated
using (false);

create policy "no_public_update_messages"
on public.guest_messages
as permissive
for update
to anon, authenticated
using (false)
with check (false);

create policy "no_public_delete_messages"
on public.guest_messages
as permissive
for delete
to anon, authenticated
using (false);

create index guest_messages_created_at_idx
on public.guest_messages (created_at desc);
