# Supabase Setup

## 1) Create table

Run this SQL in Supabase SQL editor:

```sql
create table if not exists public.guest_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 80),
  message text not null check (char_length(message) <= 500),
  created_at timestamptz not null default now()
);
```

## 2) Enable RLS + policies

```sql
alter table public.guest_messages enable row level security;

drop policy if exists "public_can_insert_messages" on public.guest_messages;
create policy "public_can_insert_messages"
on public.guest_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "no_public_select_messages" on public.guest_messages;
create policy "no_public_select_messages"
on public.guest_messages
for select
to anon
using (false);
```

This allows friends to submit messages but prevents public reads from your frontend.

## 3) Add frontend env variables

Create `frontend/.env` from `.env.example`:

```bash
cp .env.example .env
```

Then fill:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4) Run project

```bash
npm run dev
```

Messages are stored with `created_at`.
