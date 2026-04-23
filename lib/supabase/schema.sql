-- ============================================
-- TextForge Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  conversions_today integer not null default 0,
  last_reset_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversions log table
create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('blog', 'podcast')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.conversions enable row level security;

-- Profiles: users can only read/update their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Conversions: users can only read their own conversions
create policy "Users can view own conversions"
  on public.conversions for select
  using (auth.uid() = user_id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on profile changes
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
