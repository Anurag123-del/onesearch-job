import { UserProfile, JobItem } from '@/types';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


export function calculateRelevanceScore(
  profile: UserProfile,
  job: JobItem,
  profileVec: number[],
  jobVec: number[]
): number {

  let score = cosineSimilarity(profileVec, jobVec);

  // Rule-based boosts
  if (job.location && profile.preferred_locations?.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()))) {
    score += 0.05;
  }

  if (job.title && profile.job_title && job.title.toLowerCase().includes(profile.job_title.toLowerCase())) {
    score += 0.05;
  }

  const overlappingSkills = job.skills_extracted?.filter(skill => profile.skills?.includes(skill)) || [];
  score += Math.min(0.1, overlappingSkills.length * 0.01);

  // Normalize to [0, 1]
  return Math.max(0, Math.min(1, score));
}

export const buildProfileText = (profile: UserProfile): string => {
    return `${profile.job_title} with ${profile.yoe} years of experience. Skills: ${profile.skills.join(', ')}. Preferred locations: ${profile.preferred_locations.join(', ')}.`;
}

export const buildJobText = (job: JobItem): string => {
    return `${job.title} at ${job.company}. Location: ${job.location}. Description: ${job.description}. Skills: ${job.skills_extracted?.join(', ')}`;
}
