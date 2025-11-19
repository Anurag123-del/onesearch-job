import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserProfile, NormalizedJob } from '@/types';
import { generateProfileEmbedding } from './embedding';
import { isGuestMode } from './utils/guest';

/**
 * Calculates the location match score between a job and a user's profile.
 * @param job - The normalized job object.
 * @param profile - The user's profile.
 * @returns A score between 0 and 1.
 */
const calculateLocationMatch = (job: NormalizedJob, profile: UserProfile): number => {
  if (!job.locations || job.locations.length === 0) return 0.5; // Neutral score for unspecified locations
  if (job.remote && profile.preferred_locations.some(l => l.toLowerCase() === 'remote')) return 0.7;

  const userLocations = profile.preferred_locations.map(l => l.toLowerCase());
  const jobLocations = job.locations.map(l => l.toLowerCase());

  for (const userLoc of userLocations) {
    for (const jobLoc of jobLocations) {
      if (userLoc === jobLoc) return 1.0; // Exact match
      if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) return 0.8; // Metro area match
    }
  }

  return 0;
};

/**
 * Calculates the experience match score between a job and a user's profile.
 * @param job - The normalized job object.
 * @param profile - The user's profile.
 * @returns A score between 0 and 1.
 */
const calculateExperienceMatch = (job: NormalizedJob, profile: UserProfile): number => {
  if (!job.experience_min && !job.experience_max) return 0.5; // Neutral score if not specified

  const yoe = profile.yoe;
  if (job.experience_min && yoe < job.experience_min) return 1 - (job.experience_min - yoe) / job.experience_min;
  if (job.experience_max && yoe > job.experience_max) return 1 - (yoe - job.experience_max) / yoe;

  return 1.0;
};

/**
 * Calculates the recency score of a job posting.
 * @param job - The normalized job object.
 * @returns A score between 0 and 1.
 */
const calculateRecencyScore = (job: NormalizedJob): number => {
    if (!job.posted_at) return 0.5;
    const daysOld = (new Date().getTime() - new Date(job.posted_at).getTime()) / (1000 * 3600 * 24);
    if (daysOld > 30) return 0;
    return 1 - (daysOld / 30);
};

/**
 * Ranks a list of jobs based on a user's profile and a weighted scoring formula.
 * @param profile - The user's profile.
 * @param jobs - A list of jobs with their cosine similarity scores.
 * @returns A sorted list of jobs with their final relevance scores.
 */
const rankJobs = (profile: UserProfile, jobs: (NormalizedJob & { similarity: number })[]): (NormalizedJob & { score: number })[] => {
  const rankedJobs = jobs.map(job => {
    const title_sim = job.similarity;
    const skills_sim = job.similarity; // Using overall similarity as a proxy for skills
    const location_match = calculateLocationMatch(job, profile);
    const experience_match = calculateExperienceMatch(job, profile);
    const recency = calculateRecencyScore(job);
    const company_signal = 0.5; // Placeholder for company relevance

    const score =
      0.35 * title_sim +
      0.30 * skills_sim +
      0.15 * location_match +
      0.10 * experience_match +
      0.05 * recency +
      0.05 * company_signal;

    return { ...job, score };
  });

  return rankedJobs.sort((a, b) => b.score - a.score);
};

/**
 * Fetches and ranks jobs for a given user profile.
 * @param profile - The user's profile.
 * @returns A promise that resolves to a ranked list of jobs.
 */
export const getRankedJobs = async (profile: UserProfile): Promise<(NormalizedJob & { score: number })[]> => {
  if (isGuestMode()) {
    return [];
  }

  const supabase = createSupabaseBrowserClient();
  const profileEmbedding = await generateProfileEmbedding(profile);

  const { data, error } = await supabase.rpc('match_jobs', {
    query_embedding: profileEmbedding,
    match_threshold: 0.45, // Hide jobs with a score below this
    match_count: 200,
  });

  if (error) {
    console.error('Error matching jobs:', error);
    return [];
  }

  const rankedJobs = rankJobs(profile, data);
  return rankedJobs;
};
