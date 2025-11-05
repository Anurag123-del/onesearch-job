import { createClient } from '@supabase/supabase-js';
import { detectAndFetch } from '../src/lib/feeds/fetchers';
import { normalizeJob } from '../src/lib/feeds/normalize';
import { JobItem } from '../src/types';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedRemoteOk() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or service key not found.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const rawJobs = await detectAndFetch('remoteok');
  const jobs: JobItem[] = [];

  for (const rawJob of rawJobs) {
    const normalized = normalizeJob(rawJob, 'remoteok', '');
    if (normalized) {
      jobs.push(normalized);
    }
  }

  if (jobs.length > 0) {
    const { error } = await supabase.from('jobs').upsert(jobs, { onConflict: 'url' });
    if (error) {
      console.error('Error seeding RemoteOK jobs:', error);
    } else {
      console.log(`Successfully seeded ${jobs.length} RemoteOK jobs.`);
    }
  }
}

seedRemoteOk();
