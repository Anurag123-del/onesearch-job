import { useState, useEffect, useMemo, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { JobItem, UserProfile } from '@/types';
import { embedText } from '@/lib/matching/embeddings';
import { calculateRelevanceScore, buildProfileText, buildJobText } from '@/lib/matching/score';

type Filters = {
  title: string;
  skills: string[];
  locations: string[];
};

type JobWithScore = JobItem & { score?: number };

export function useJobsAndMatching(profile: UserProfile | null) {
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [filters, setFilters] = useState<Filters>({ title: '', skills: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      const supabase = createSupabaseBrowserClient();
      const { data, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(200);

      if (jobsError) {
        setError(jobsError.message);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const hasJobs = jobs.length > 0;
    const runMatching = async () => {
      if (!profile || !profile.job_title || !hasJobs) return;

      setMatching(true);
      const profileText = buildProfileText(profile);
      const profileVec = await embedText(profileText);

      const jobsWithScores = await Promise.all(
        jobs.map(async (job) => {
          const jobText = buildJobText(job);
          const jobVec = await embedText(jobText);
          const score = calculateRelevanceScore(profile, job, profileVec, jobVec);
          return { ...job, score };
        })
      );

      jobsWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));
      setJobs(jobsWithScores);
      setMatching(false);
    };

    runMatching();
  }, [profile, jobs]);

  const filteredJobs = useMemo(() => {
    let tempFilteredJobs = [...jobs];

    if (filters.title) {
      tempFilteredJobs = tempFilteredJobs.filter(job => job.title?.toLowerCase().includes(filters.title.toLowerCase()));
    }
    if (filters.skills.length > 0) {
      tempFilteredJobs = tempFilteredJobs.filter(job => filters.skills.some(skill => job.skills_extracted?.includes(skill)));
    }
    if (filters.locations.length > 0) {
      tempFilteredJobs = tempFilteredJobs.filter(job => filters.locations.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase())));
    }

    return tempFilteredJobs;
  }, [jobs, filters]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  return { jobs: filteredJobs, loading, matching, error, handleFilterChange };
}
