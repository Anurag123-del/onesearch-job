import { describe, it, expect } from 'vitest';
import { normalizeJob } from '@/lib/feeds/normalize';
import greenhouseData from './fixtures/greenhouse.json';
import leverData from './fixtures/lever.json';

describe('Data Normalization', () => {

  it('correctly normalizes a job from Greenhouse', () => {
    const rawJob = greenhouseData.jobs[0];
    const companyName = 'Greenhouse Inc.';
    const normalized = normalizeJob(rawJob, 'greenhouse', companyName);

    expect(normalized).not.toBeNull();
    expect(normalized?.source).toBe('greenhouse');
    expect(normalized?.company).toBe(companyName);
    expect(normalized?.title).toBe('Software Engineer');
    expect(normalized?.location).toBe('San Francisco, CA');
    expect(normalized?.url).toBe('https://example.com/job1');
    expect(normalized?.description).toContain('<p>');
    expect(normalized?.description).not.toContain('<script>');
    expect(normalized?.published_at).toBe('2023-10-27T10:00:00Z');
  });

  it('correctly normalizes a job from Lever', () => {
    const rawJob = leverData[0];
    const companyName = 'Lever Co.';
    const normalized = normalizeJob(rawJob, 'lever', companyName);

    expect(normalized).not.toBeNull();
    expect(normalized?.source).toBe('lever');
    expect(normalized?.company).toBe(companyName);
    expect(normalized?.title).toBe('Product Manager');
    expect(normalized?.location).toBe('New York, NY');
    expect(normalized?.url).toBe('https://example.com/job2');
    expect(normalized?.published_at).toBe(new Date(1635336000000).toISOString());
  });

  it('returns null for invalid or incomplete job data', () => {
    const invalidGreenhouseJob = { id: 123 }; // Missing required fields
    const normalized = normalizeJob(invalidGreenhouseJob, 'greenhouse', 'Test Co');
    expect(normalized).toBeNull();
  });

});
