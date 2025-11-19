import { Connector, NormalizedJob } from '@/types';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

// Helper function to create the hash signature for deduplication.
const createHash = (title: string, company: string, location: string, description: string) => {
  const cleanDescription = description.replace(/\s+/g, ' ').trim();
  const signature = `${title.trim()}${company.trim()}${location.trim()}${cleanDescription.substring(0, 500)}`;
  return crypto.createHash('sha1').update(signature).digest('hex');
};

export class LeverConnector implements Connector {
  private companyName: string;
  private feedUrl: string;

  constructor(companyName: string, feedUrl: string) {
    this.companyName = companyName;
    this.feedUrl = feedUrl;
  }

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
    const jobs = JSON.parse(rawData);
    const normalizedJobs: NormalizedJob[] = [];

    for (const job of jobs) {
        const descriptionText = new JSDOM(job.description).window.document.body.textContent ?? '';
        const location = job.categories?.location || 'Remote';

        const normalizedJob: NormalizedJob = {
            source: 'lever',
            source_job_id: job.id,
            title: job.text,
            company: this.companyName,
            locations: [location],
            remote: location.toLowerCase().includes('remote'),
            description_text: descriptionText,
            posted_at: new Date(job.createdAt),
            apply_url: job.hostedUrl,
            hash_signature: createHash(job.text, this.companyName, location, descriptionText),
      };
      normalizedJobs.push(normalizedJob);
    }
    return normalizedJobs;
  }
}
