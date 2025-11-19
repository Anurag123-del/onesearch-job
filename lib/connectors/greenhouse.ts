import { Connector, NormalizedJob } from '@/types';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

// Helper function to create the hash signature for deduplication.
const createHash = (title: string, company: string, location: string, description: string) => {
  const cleanDescription = description.replace(/\s+/g, ' ').trim();
  const signature = `${title.trim()}${company.trim()}${location.trim()}${cleanDescription.substring(0, 500)}`;
  return crypto.createHash('sha1').update(signature).digest('hex');
};

export class GreenhouseConnector implements Connector {
  private companyName: string;
  private feedUrl: string;

  constructor(companyName: string, feedUrl: string) {
    this.companyName = companyName;
    this.feedUrl = feedUrl;
  }

  async discover(): Promise<string[]> {
    // For Greenhouse, the feed URL is a single endpoint that lists all jobs.
    // So, we just return the feed URL itself.
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
    const jobs = JSON.parse(rawData).jobs;
    const normalizedJobs: NormalizedJob[] = [];

    for (const job of jobs) {
        const descriptionText = new JSDOM(job.content).window.document.body.textContent ?? '';
        const location = job.location?.name || 'Remote';

        const normalizedJob: NormalizedJob = {
            source: 'greenhouse',
            source_job_id: String(job.id),
            title: job.title,
            company: this.companyName,
            locations: [location],
            remote: location.toLowerCase().includes('remote'),
            description_text: descriptionText,
            posted_at: new Date(job.updated_at),
            apply_url: job.absolute_url,
            hash_signature: createHash(job.title, this.companyName, location, descriptionText),
      };
      normalizedJobs.push(normalizedJob);
    }
    return normalizedJobs;
  }
}
