import OpenAI from 'openai';
import { UserProfile, NormalizedJob } from '@/types';

// Initialize the OpenAI client with the API key from environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a descriptive string from a user's profile for embedding.
 * @param profile - The user's profile.
 * @returns A string that concatenates the user's job title, experience, skills, and locations.
 */
const createProfileString = (profile: UserProfile): string => {
  return `Job Title: ${profile.job_title}. Years of Experience: ${profile.yoe}. Skills: ${profile.skills.join(', ')}. Preferred Locations: ${profile.preferred_locations.join(', ')}.`;
};

/**
 * Generates a descriptive string from a job posting for embedding.
 * @param job - The normalized job object.
 * @returns A string that concatenates the job's title, company, location, and description.
 */
const createJobString = (job: NormalizedJob): string => {
  return `Job Title: ${job.title}. Company: ${job.company}. Location: ${job.locations?.join(', ')}. Description: ${job.description_text}`;
};

/**
 * Generates a vector embedding for a given text using the specified OpenAI model.
 * @param text - The text to be embedded.
 * @returns A promise that resolves to the vector embedding.
 */
const getEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  });
  return response.data[0].embedding;
};

// --- EXPORTED FUNCTIONS ---

/**
 * Generates a vector embedding for a user's profile.
 * @param profile - The user's profile.
 * @returns A promise that resolves to the vector embedding.
 */
export const generateProfileEmbedding = async (profile: UserProfile): Promise<number[]> => {
  const profileString = createProfileString(profile);
  return getEmbedding(profileString);
};

/**
 * Generates a vector embedding for a job posting.
 * @param job - The normalized job object.
 * @returns A promise that resolves to the vector embedding.
 */
export const generateJobEmbedding = async (job: NormalizedJob): Promise<number[]> => {
  const jobString = createJobString(job);
  return getEmbedding(jobString);
};
