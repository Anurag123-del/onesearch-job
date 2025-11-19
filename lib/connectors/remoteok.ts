import { Connector, NormalizedJob } from '@/types';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

// Helper function to create the hash signature for deduplication.
const createHash = (title: string, company: string, location: string, description: string) => {
  const cleanDescription = description.replace(/\s+/g, ' ').trim();
  const signature = `${title.trim()}${company.trim()}${location.trim()}${cleanDescription.substring(0, 500)}`;
  return crypto.createHash('sha1').update(signature).digest('hex');
};

export class RemoteOkConnector implements Connector {
  private feedUrl = 'https://remoteok.com/api';

  async discover(): Promise<string[]> {
    return [this.feedUrl];
  }

  async fetch(url: string): Promise<string> {
    const response = await fetch(url, { headers: { 'User-Agent': 'OneSearch/1.0' } });
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
    }
    return response.text();
  }

  async parse(rawData: string): Promise<NormalizedJob[]> {
    const jobs = JSON.parse(rawData).slice(1); // The first element is a legal notice
    const normalizedJobs: NormalizedJob[] = [];

    for (const job of jobs) {
        const descriptionText = new JSDOM(job.description).window.document.body.textContent ?? '';
        const location = job.location || 'Remote';

        const normalizedJob: NormalizedJob = {
            source: 'remoteok',
            source_job_id: String(job.id),
            title: job.position,
            company: job.company,
            locations: [location],
            remote: true,
            description_text: descriptionText,
            posted_at: new Date(job.date),
            apply_url: job.url,
            hash_signature: createHash(job.position, job.company, location, descriptionText),
        };
        normalizedJobs.push(normalizedJob);
    }
    return normalizedJobs;
  }
}
