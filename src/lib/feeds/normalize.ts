import { JobItem } from '@/types';
import DOMPurify from 'isomorphic-dompurify';
import { extractSkills } from '../utils/skills';

// Sanitize HTML to prevent XSS, but allow basic formatting
const sanitize = (html: string | null | undefined): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'ul', 'ol', 'li'] });
};

export function normalizeGreenhouseJob(rawJob: Record<string, unknown>, companyName: string): JobItem | null {
  if (!rawJob.id || !rawJob.title || !rawJob.absolute_url) return null;

  return {
    source: 'greenhouse',
    company: companyName,
    title: rawJob.title as string,
    location: (rawJob.location as { name: string })?.name || 'Remote',
    url: rawJob.absolute_url as string,
    description: sanitize(rawJob.content as string),
    skills_extracted: extractSkills(rawJob.content as string),
    published_at: rawJob.updated_at as string,
  };
}

export function normalizeLeverJob(rawJob: Record<string, unknown>, companyName: string): JobItem | null {
  if (!rawJob.id || !rawJob.text || !rawJob.hostedUrl) return null;

  return {
    source: 'lever',
    company: companyName,
    title: rawJob.text as string,
    location: (rawJob.categories as { location: string })?.location || 'Remote',
    url: rawJob.hostedUrl as string,
    description: sanitize(rawJob.description as string),
    skills_extracted: extractSkills(rawJob.description as string),
    published_at: new Date(rawJob.createdAt as number).toISOString(),
  };
}

export function normalizeRemoteOkJob(rawJob: Record<string, unknown>): JobItem | null {
    // RemoteOK jobs must have an id, position, url, and company
    if (!rawJob.id || !rawJob.position || !rawJob.url || !rawJob.company) {
      return null;
    }

    return {
      source: 'remoteok',
      company: rawJob.company as string,
      title: rawJob.position as string,
      location: (rawJob.location as string) || 'Remote',
      url: rawJob.url as string,
      description: sanitize(rawJob.description as string),
      skills_extracted: (rawJob.tags as string[]) || extractSkills(rawJob.description as string),
      published_at: rawJob.date as string,
    };
  }


// Main normalizer function
export function normalizeJob(
  rawJob: Record<string, unknown>,
  source: 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'teamtailor' | 'remoteok' | 'other',
  companyName: string
): JobItem | null {
  switch (source) {
    case 'greenhouse':
      return normalizeGreenhouseJob(rawJob, companyName);
    case 'lever':
      return normalizeLeverJob(rawJob, companyName);
    case 'remoteok':
        return normalizeRemoteOkJob(rawJob);
    // TODO: Add Ashby, Workable, Teamtailor normalizers
    default:
      console.warn(`Normalization not implemented for source: ${source}`);
      return null;
  }
}
