import { createSupabaseServerClient } from '@/lib/supabase/server'; // Corrected import
import { GreenhouseConnector } from '@/lib/connectors/greenhouse';
import { LeverConnector } from '@/lib/connectors/lever';
import { RemoteOkConnector } from '@/lib/connectors/remoteok';
import { LinkedInConnector } from '@/lib/connectors/linkedin';
import { NaukriConnector } from '@/lib/connectors/naukri';
import { InstahyreConnector } from '@/lib/connectors/instahyre';
import { IndeedConnector } from '@/lib/connectors/indeed';
import { generateJobEmbedding } from '@/lib/embedding';
import { NormalizedJob } from '@/types';

export async function POST() {
  console.log('Starting ingestion cron job...');
  const supabase = createSupabaseServerClient();
  const { data: companies, error } = await supabase.from('companies').select('*');

  if (error) {
    console.error('Error fetching companies:', error);
    return new Response('Error fetching companies.', { status: 500 });
  }

  const connectors = [];
  for (const company of companies) {
    switch (company.ats_type) {
      case 'greenhouse':
        connectors.push(new GreenhouseConnector(company.name, company.feed_url));
        break;
      case 'lever':
        connectors.push(new LeverConnector(company.name, company.feed_url));
        break;
    }
  }
  connectors.push(new RemoteOkConnector());

  if (process.env.ENABLE_HIGH_RISK_SOURCES === 'true') {
    if (process.env.ENABLE_LINKEDIN === 'true') {
      connectors.push(new LinkedInConnector());
    }
    if (process.env.ENABLE_NAUKRI === 'true') {
      connectors.push(new NaukriConnector());
    }
    if (process.env.ENABLE_INSTAHYRE === 'true') {
      connectors.push(new InstahyreConnector());
    }
    if (process.env.ENABLE_INDEED === 'true') {
      connectors.push(new IndeedConnector());
    }
  }


  for (const connector of connectors) {
    try {
      const jobUrls = await connector.discover({ keywords: 'Software Engineer', location: 'India' });
      for (const url of jobUrls) {
        const rawData = await connector.fetch(url);
        const normalizedJobs = await connector.parse(rawData);

        if (Array.isArray(normalizedJobs)) {
            for (const job of normalizedJobs) {
                if (job) {
                    const embedding = await generateJobEmbedding(job);
                    job.vector_embedding = embedding;
                    await upsertJob(job);
                }
            }
        } else if (normalizedJobs) {
            const embedding = await generateJobEmbedding(normalizedJobs);
            normalizedJobs.vector_embedding = embedding;
            await upsertJob(normalizedJobs);
        }
      }
    } catch (error) {
      console.error(`Error with connector ${connector.constructor.name}:`, error);
    }
  }

  console.log('Ingestion cron job finished.');
  return new Response('Ingestion complete.', { status: 200 });
}

async function upsertJob(job: NormalizedJob) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('jobs').upsert(job, { onConflict: 'hash_signature' });
  if (error) {
    console.error('Error upserting job:', error);
  } else {
    console.log('Upserted job:', data);
  }
}
