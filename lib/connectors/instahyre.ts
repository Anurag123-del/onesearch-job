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

export class InstahyreConnector implements Connector {
  async discover(searchParams: { keywords: string }): Promise<string[]> {
    if (process.env.ENABLE_INSTAHYRE !== 'true') {
      console.log('Instahyre connector is disabled.');
      return [];
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const jobUrls: string[] = [];

    try {
      const url = `https://www.instahyre.com/search-jobs?search=${searchParams.keywords}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const links = await page.$$eval('a.job-title', (anchors) => anchors.map(a => (a as HTMLAnchorElement).href));
      jobUrls.push(...links);

    } catch (error) {
      console.error('Error discovering Instahyre jobs:', error);
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
      console.error(`Error fetching Instahyre job page: ${jobUrl}`, error);
    } finally {
      await browser.close();
    }
    return content;
  }

  async parse(rawData: string): Promise<NormalizedJob | null> {
    const dom = new JSDOM(rawData);
    const doc = dom.window.document;

    try {
      const title = doc.querySelector('.job-title')?.textContent?.trim() || '';
      const company = doc.querySelector('.company-name')?.textContent?.trim() || '';
      const location = doc.querySelector('.job-locations')?.textContent?.trim() || '';
      const description = doc.querySelector('.job-description')?.textContent?.trim() || '';
      const applyUrl = doc.querySelector('.apply-button')?.getAttribute('href') || '';

      if (!title || !company || !location || !description) {
        return null;
      }

      const normalizedJob: NormalizedJob = {
        source: 'instahyre',
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
      console.error('Error parsing Instahyre job:', error);
      return null;
    }
  }
}
