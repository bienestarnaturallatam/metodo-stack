-- ============================================================
-- STACK Habit Tracker — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── HABITS ──────────────────────────────────────────────────
create table public.habits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  color       text default '#2d9e6b',
  position    int  default 0,
  created_at  timestamptz default now(),
  archived_at timestamptz
);

alter table public.habits enable row level security;

create policy "Users own their habits"
  on public.habits for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index habits_user_id_idx on public.habits(user_id);

-- ── COMPLETIONS ─────────────────────────────────────────────
-- One row per (habit, date) — presence = completed
create table public.completions (
  id         uuid primary key default uuid_generate_v4(),
  habit_id   uuid not null references public.habits(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  created_at timestamptz default now(),
  unique (habit_id, date)
);

alter table public.completions enable row level security;

create policy "Users own their completions"
  on public.completions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index completions_user_date_idx on public.completions(user_id, date);

-- ── MOOD LOGS ───────────────────────────────────────────────
create table public.mood_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  mood        smallint check (mood between 1 and 10),
  motivation  smallint check (motivation between 1 and 10),
  updated_at  timestamptz default now(),
  unique (user_id, date)
);

alter table public.mood_logs enable row level security;

create policy "Users own their mood logs"
  on public.mood_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index mood_logs_user_date_idx on public.mood_logs(user_id, date);

-- ── PROFILES (optional display name / avatar) ───────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users own their profile"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
