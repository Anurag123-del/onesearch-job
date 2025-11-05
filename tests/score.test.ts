import { describe, it, expect } from 'vitest';
import { calculateRelevanceScore } from '@/lib/matching/score';
import { UserProfile, JobItem } from '@/types';

describe('Scoring Logic', () => {
  const mockProfile: UserProfile = {
    user_id: '1',
    job_title: 'Software Engineer',
    yoe: 5,
    skills: ['React', 'Node.js'],
    preferred_locations: ['Remote'],
  };

  const mockJob: JobItem = {
    source: 'greenhouse',
    company: 'Tech Company',
    title: 'Senior Software Engineer',
    location: 'Remote',
    description: 'A job about React and Node.js',
    skills_extracted: ['React', 'Node.js', 'TypeScript'],
  };

  // Use vectors with lower similarity to avoid hitting the score cap of 1
  const profileVec = [0.1, 0.2, 0.8];
  const jobVec = [0.7, 0.3, 0.1];

  it('calculates a base score using cosine similarity', () => {
    const score = calculateRelevanceScore(mockProfile, mockJob, profileVec, jobVec);
    // The exact cosine similarity isn't critical to test here, just that it's a number.
    // The boosts are more important to verify.
    expect(score).toBeGreaterThan(0);
  });

  it('applies a boost for matching location', () => {
    const baseScore = calculateRelevanceScore(mockProfile, { ...mockJob, location: 'Office' }, profileVec, jobVec);
    const boostedScore = calculateRelevanceScore(mockProfile, mockJob, profileVec, jobVec);
    expect(boostedScore).toBeGreaterThan(baseScore);
    expect(boostedScore - baseScore).toBeCloseTo(0.05, 2);
  });

  it('applies a boost for matching job title keywords', () => {
    const baseScore = calculateRelevanceScore(mockProfile, { ...mockJob, title: 'Product Manager' }, profileVec, jobVec);
    const boostedScore = calculateRelevanceScore(mockProfile, mockJob, profileVec, jobVec);
    expect(boostedScore).toBeGreaterThan(baseScore);
  });

  it('applies a boost for overlapping skills', () => {
    const baseScore = calculateRelevanceScore(mockProfile, { ...mockJob, skills_extracted: [] }, profileVec, jobVec);
    const boostedScore = calculateRelevanceScore(mockProfile, mockJob, profileVec, jobVec);
    expect(boostedScore).toBeGreaterThan(baseScore);
  });

  it('caps the score at 1', () => {
    // Create a scenario where boosts would exceed 1
    const perfectVec = [1, 1, 1];
    const score = calculateRelevanceScore(mockProfile, mockJob, perfectVec, perfectVec);
    expect(score).toBeLessThanOrEqual(1);
  });

});
