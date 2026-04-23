-- Run this in Supabase SQL Editor
alter table public.profiles
  add column if not exists subscription_status text not null default 'inactive'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'inactive')),
  add column if not exists trial_ends_at timestamptz;
