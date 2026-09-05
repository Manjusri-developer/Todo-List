-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create extension if not exists "pgcrypto";

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 280),
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_created_at_idx on public.todos (created_at desc);

alter table public.todos enable row level security;

drop policy if exists "Users can read own todos" on public.todos;
create policy "Users can read own todos"
  on public.todos for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own todos" on public.todos;
create policy "Users can insert own todos"
  on public.todos for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own todos" on public.todos;
create policy "Users can update own todos"
  on public.todos for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own todos" on public.todos;
create policy "Users can delete own todos"
  on public.todos for delete
  to authenticated
  using (auth.uid() = user_id);

-- Optional: allow the demo to work before login by permitting anonymous rows.
-- Comment these out in production if you only want signed-in users.
drop policy if exists "Anon can manage unsigned todos" on public.todos;
create policy "Anon can manage unsigned todos"
  on public.todos for all
  to anon
  using (user_id is null)
  with check (user_id is null);
