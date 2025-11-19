-- Enable the pgvector extension to store and query vector embeddings.
create extension if not exists vector;

-- Drop the old jobs table to replace it with the new schema.
drop table if exists jobs;

-- Create the unified jobs table with a comprehensive set of columns.
create table if not exists jobs (
  id bigserial primary key,
  source text not null, -- e.g., 'greenhouse', 'linkedin', 'naukri'
  source_job_id text, -- The unique ID from the original source
  title text not null,
  company text,
  locations text[] default '{}',
  country text,
  remote boolean default false,
  experience_min int check (experience_min >= 0),
  experience_max int check (experience_max >= 0),
  skills text[] default '{}',
  description_text text,
  description_html_clean text,
  seniority text, -- e.g., 'Entry-Level', 'Mid-Level', 'Senior'
  salary_min numeric,
  salary_max numeric,
  currency text,
  posted_at timestamptz,
  apply_url text,
  hash_signature text not null,
  vector_embedding vector(1536), -- OpenAI text-embedding-3-large has 1536 dimensions
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes for efficient querying on commonly filtered columns.
create index on jobs (source);
create index on jobs (company);
create index on jobs (country);
create index on jobs (remote);
create index on jobs (posted_at);

-- Create a unique index on the hash_signature to prevent duplicate jobs.
create unique index on jobs (hash_signature);

-- Add a GIN index for full-text search as a fallback to semantic search.
create index on jobs using gin (to_tsvector('english', description_text));

-- Add an IVFFlat index for approximate nearest neighbor search on vector embeddings.
-- This significantly speeds up cosine similarity queries. The list size is a good
-- starting point for up to 1M job postings. Adjust as the dataset grows.
create index on jobs using ivfflat (vector_embedding vector_cosine_ops)
with
  (lists = 100);

-- Enable Row Level Security to protect the data.
alter table jobs enable row level security;

-- By default, no one can access the jobs table.
-- We will create a policy to allow read-only access for all authenticated users,
-- as jobs are public information.
create policy "jobs are readable by everyone" on jobs for
select
  using (true);
