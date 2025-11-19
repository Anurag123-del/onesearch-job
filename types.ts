// The user's profile, as stored in the database and used for matching.
export type UserProfile = {
  user_id: string;
  job_title: string;
  yoe: number;
  skills: string[];
  preferred_locations: string[];
};

// Represents a job after it has been normalized into our standard schema.
export type NormalizedJob = {
  source: string;
  source_job_id?: string;
  title: string;
  company: string;
  locations?: string[];
  country?: string;
  remote: boolean;
  experience_min?: number;
  experience_max?: number;
  skills?: string[];
  description_text: string;
  description_html_clean?: string;
  seniority?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  posted_at?: Date;
  apply_url: string;
  hash_signature: string;
  vector_embedding?: number[];
};

// Interface for a data source connector, defining the required methods.
export interface Connector {
  /**
   * Discovers job URLs from a source based on search parameters.
   * @param searchParams - The search criteria (e.g., keywords, location).
   * @returns A list of job URLs to be processed.
   */
  discover(searchParams: Record<string, any>): Promise<string[]>;

  /**
   * Fetches the raw data (HTML or JSON) for a single job URL.
   * @param jobUrl - The URL of the job posting.
   * @returns The raw data as a string.
   */
  fetch(jobUrl: string): Promise<string>;

  /**
   * Parses the raw job data into a standardized NormalizedJob object.
   * @param rawData - The raw HTML or JSON from the fetch step.
   * @returns A NormalizedJob object or null if parsing fails.
   */
  parse(rawData: string): Promise<NormalizedJob[] | NormalizedJob | null>;
}
