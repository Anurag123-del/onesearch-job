import { JobItem } from '@/types';

// Basic in-memory cache to avoid refetching during the same session/build
const cache = new Map<string, { data: JobItem[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithRetry(url: string, retries = 3, backoff = 300): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'OneSearch/1.0' } });
      if (res.ok) return res.json();
      if (res.status === 404) return null; // Don't retry on 404
      console.error(`Fetch failed with status ${res.status}. Retrying in ${backoff}ms...`);
    } catch (error) {
      console.error(`Fetch failed with error: ${error}. Retrying in ${backoff}ms...`);
    }
    await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
  }
  throw new Error(`Failed to fetch from ${url} after ${retries} retries.`);
}


async function fetchGreenhouseJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
  const data = await fetchWithRetry(feedUrl) as { jobs: Record<string, unknown>[] };
  return data?.jobs || [];
}

async function fetchWorkableJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
    console.warn("Workable fetcher not implemented.");
    return [];
}

async function fetchTeamtailorJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
    console.warn("Teamtailor fetcher not implemented.");
    return [];
}

async function fetchLeverJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
  const data = await fetchWithRetry(feedUrl) as Record<string, unknown>[];
  return data || [];
}


async function fetchWorkableJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
    console.warn("Workable fetcher not implemented.");
    return [];
}

async function fetchTeamtailorJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
    console.warn("Teamtailor fetcher not implemented.");
    return [];
}

async function fetchAshbyJobs(feedUrl: string): Promise<Record<string, unknown>[]> {
  const data = await fetchWithRetry(feedUrl) as { jobs: Record<string, unknown>[] };
  return data?.jobs || [];
}

async function fetchRemoteOkJobs(): Promise<Record<string, unknown>[]> {
  const data = await fetchWithRetry('https://remoteok.com/api') as Record<string, unknown>[];
  // The first element is often a header/legal notice, so we slice it.
  return Array.isArray(data) ? data.slice(1) : [];
}


export async function detectAndFetch(
  atsType: string,
  feedUrl?: string | null
): Promise<Record<string, unknown>[]> {

  const cacheKey = feedUrl || atsType;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[CACHE] Hit for ${cacheKey}`);
      return cached.data;
    }
  }
  console.log(`[FETCH] Miss for ${cacheKey}`);


  try {
    let jobs: Record<string, unknown>[] = [];
    switch (atsType) {
      case 'greenhouse':
        if (!feedUrl) throw new Error('Greenhouse feed URL is required.');
        jobs = await fetchGreenhouseJobs(feedUrl);
        break;
      case 'lever':
        if (!feedUrl) throw new Error('Lever feed URL is required.');
        jobs = await fetchLeverJobs(feedUrl);
        break;
    case 'workable':
        if (!feedUrl) throw new Error('Workable feed URL is required.');
        jobs = await fetchWorkableJobs(feedUrl);
        break;
    case 'teamtailor':
        if (!feedUrl) throw new Error('Teamtailor feed URL is required.');
        jobs = await fetchTeamtailorJobs(feedUrl);
        break;
      case 'ashby':
        if (!feedUrl) throw new Error('Ashby feed URL is required.');
        jobs = await fetchAshbyJobs(feedUrl);
        break;
    case 'workable':
        if (!feedUrl) throw new Error('Workable feed URL is required.');
        jobs = await fetchWorkableJobs(feedUrl);
        break;
    case 'teamtailor':
        if (!feedUrl) throw new Error('Teamtailor feed URL is required.');
        jobs = await fetchTeamtailorJobs(feedUrl);
        break;
      case 'remoteok':
        jobs = await fetchRemoteOkJobs();
        break;
      // TODO: Add Ashby, Workable, Teamtailor
      default:
        console.warn(`Unsupported ATS type: ${atsType}`);
        return [];
    }

    cache.set(cacheKey, { data: jobs as JobItem[], timestamp: Date.now() });
    return jobs;

  } catch (error) {
    console.error(`Failed to fetch jobs for ${atsType} from ${feedUrl}:`, error);
    return []; // Return empty array on failure, no hard fail
  }
}
