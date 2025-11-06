-- Users are managed by Supabase auth. We mirror minimal fields when needed.
create table if not exists profiles (
user_id uuid primary key references auth.users(id) on delete cascade,
job_title text,
yoe int check (yoe >= 0),
skills text[] default '{}',
preferred_locations text[] default '{}',
created_at timestamptz default now(),
updated_at timestamptz default now()
);

create table if not exists companies (
id bigserial primary key,
name text not null,
website text,
ats_type text check (ats_type in ('greenhouse','lever','ashby','workable','teamtailor','remoteok','other')),
feed_url text, -- public JSON endpoint if known
is_active boolean default true,
created_at timestamptz default now(),
constraint companies_name_key unique (name)
);

create table if not exists jobs (
id bigserial primary key,
source text not null, -- e.g., 'greenhouse','lever','ashby','workable','teamtailor','remoteok'
company text,
title text,
location text,
url text,
description text,
skills_extracted text[] default '{}',
vector jsonb, -- store client-side vector if we ever persist it (optional)
published_at timestamptz,
ingested_at timestamptz default now(),
constraint jobs_url_key unique (url)
);

create index on jobs (source);
create index on jobs (company);
create index on jobs (title);
create index on jobs (location);
create index on jobs (ingested_at);

create table if not exists matches (
user_id uuid references auth.users(id) on delete cascade,
job_id bigint references jobs(id) on delete cascade,
relevance_score numeric,
created_at timestamptz default now(),
primary key (user_id, job_id)
);

-- Simple settings table for cron cursors, feature flags
create table if not exists app_settings (
key text primary key,
value jsonb,
updated_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table matches enable row level security;

create policy "profiles are readable by owner" on profiles
for select using (auth.uid() = user_id);

create policy "profiles are upsertable by owner" on profiles
for insert with check (auth.uid() = user_id);

create policy "profiles are updateable by owner" on profiles
for update using (auth.uid() = user_id);

create policy "matches readable by owner" on matches
for select using (auth.uid() = user_id);

create policy "matches insertable by owner" on matches
for insert with check (auth.uid() = user_id);
