export type UserProfile = {
  user_id: string;
  job_title: string;
  yoe: number;
  skills: string[];
  preferred_locations: string[];
};

export type JobItem = {
  id?: number;
  source: 'greenhouse'|'lever'|'ashby'|'workable'|'teamtailor'|'remoteok'|'other';
  company: string | null;
  title: string | null;
  location: string | null;
  url: string | null;
  description: string | null;
  skills_extracted: string[];
  published_at?: string | null;
  ingested_at?: string | null;
};
