import { createSupabaseServerClient } from '@/lib/supabase/server';
import { detectAndFetch } from '@/lib/feeds/fetchers';
import { normalizeJob } from '@/lib/feeds/normalize';
import { JobItem } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('name, ats_type, feed_url')
    .eq('is_active', true);

  if (companiesError) {
    return NextResponse.json({ error: companiesError.message }, { status: 500 });
  }

  const fetchPromises = companies
    .filter(company => company.ats_type && company.feed_url)
    .map(async (company) => {
      const rawJobs = await detectAndFetch(company.ats_type!, company.feed_url!);
      return rawJobs
        .map(rawJob => normalizeJob(rawJob, company.ats_type as 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'teamtailor' | 'remoteok' | 'other', company.name))
        .filter((job): job is JobItem => job !== null);
    });

  const companyJobs = (await Promise.all(fetchPromises)).flat();

  // Also fetch from RemoteOK
  const remoteOkJobsRaw = await detectAndFetch('remoteok');
  const remoteOkJobs = remoteOkJobsRaw
    .map(rawJob => normalizeJob(rawJob, 'remoteok', ''))
    .filter((job): job is JobItem => job !== null);

  const allJobs = [...companyJobs, ...remoteOkJobs];

  if (allJobs.length > 0) {
    const { error: upsertError } = await supabase.from('jobs').upsert(allJobs, { onConflict: 'url' });
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: `Ingested ${allJobs.length} jobs.` });
}
