-- Create a function to match jobs based on cosine similarity.
create
or replace function match_jobs (
  query_embedding vector (1536),
  match_threshold float,
  match_count int
) returns table (
  id bigint,
  source text,
  source_job_id text,
  title text,
  company text,
  locations text [],
  country text,
  remote boolean,
  experience_min int,
  experience_max int,
  skills text [],
  description_text text,
  description_html_clean text,
  seniority text,
  salary_min numeric,
  salary_max numeric,
  currency text,
  posted_at timestamptz,
  apply_url text,
  hash_signature text,
  similarity float
) language sql stable as $$
  select
    jobs.id,
    jobs.source,
    jobs.source_job_id,
    jobs.title,
    jobs.company,
    jobs.locations,
    jobs.country,
    jobs.remote,
    jobs.experience_min,
    jobs.experience_max,
    jobs.skills,
    jobs.description_text,
    jobs.description_html_clean,
    jobs.seniority,
    jobs.salary_min,
    jobs.salary_max,
    jobs.currency,
    jobs.posted_at,
    jobs.apply_url,
    jobs.hash_signature,
    1 - (jobs.vector_embedding <=> query_embedding) as similarity
  from
    jobs
  where
    1 - (jobs.vector_embedding <=> query_embedding) > match_threshold
  order by
    similarity desc
  limit
    match_count;
$$;
