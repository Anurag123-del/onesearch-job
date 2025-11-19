import { chromium } from 'playwright';
import { Connector, NormalizedJob } from '@/types';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

// Helper function to create the hash signature for deduplication.
const createHash = (title: string, company: string, location: string, description: string) => {
  const cleanDescription = description.replace(/\s+/g, ' ').trim();
  const signature = `${title.trim()}${company.trim()}${location.trim()}${cleanDescription.substring(0, 500)}`;
  return crypto.createHash('sha1').update(signature).digest('hex');
};

export class NaukriConnector implements Connector {
  async discover(searchParams: { keywords: string; location: string }): Promise<string[]> {
    if (process.env.ENABLE_NAUKRI !== 'true') {
      console.log('Naukri connector is disabled.');
      return [];
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const jobUrls: string[] = [];

    try {
      const url = `https://www.naukri.com/${searchParams.keywords}-jobs-in-${searchParams.location}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const links = await page.$$eval('a.title', (anchors) => anchors.map(a => (a as HTMLAnchorElement).href));
      jobUrls.push(...links);

    } catch (error) {
      console.error('Error discovering Naukri jobs:', error);
    } finally {
      await browser.close();
    }
    return jobUrls;
  }

  async fetch(jobUrl: string): Promise<string> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let content = '';
    try {
      await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });
      content = await page.content();
    } catch (error) {
      console.error(`Error fetching Naukri job page: ${jobUrl}`, error);
    } finally {
      await browser.close();
    }
    return content;
  }

  async parse(rawData: string): Promise<NormalizedJob | null> {
    const dom = new JSDOM(rawData);
    const doc = dom.window.document;

    try {
      const title = doc.querySelector('.jd-header-title')?.textContent?.trim() || '';
      const company = doc.querySelector('.jd-header-comp-name a')?.textContent?.trim() || '';
      const location = doc.querySelector('.location .loc-text')?.textContent?.trim() || '';
      const description = doc.querySelector('.job-desc')?.textContent?.trim() || '';
      const applyUrl = doc.querySelector('#apply-button')?.getAttribute('href') || '';

      if (!title || !company || !location || !description) {
        return null;
      }

      const normalizedJob: NormalizedJob = {
        source: 'naukri',
        title,
        company,
        locations: [location],
        remote: location.toLowerCase().includes('remote'),
        description_text: description,
        apply_url: applyUrl,
        hash_signature: createHash(title, company, location, description),
      };

      return normalizedJob;
    } catch (error) {
      console.error('Error parsing Naukri job:', error);
      return null;
    }
  }
}
