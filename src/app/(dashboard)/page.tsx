'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useJobsAndMatching } from '@/hooks/useJobsAndMatching';
import JobCard from '@/components/JobCard';
import JobsFilters from '@/components/JobsFilters';
import { isGuestMode } from '@/lib/utils/guest';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const JOBS_PER_PAGE = 10;

export default function DashboardPage() {
  const router = useRouter();
  const guestMode = isGuestMode();
  const { profile, loading: profileLoading } = useUserProfile();
  const { jobs, loading: jobsLoading, matching, handleFilterChange } = useJobsAndMatching(profile);
  const [page, setPage] = useState(1);

  const paginatedJobs = jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (profileLoading) {
    return <p className="text-center p-8">Loading profile...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Job Feed</h1>
        {!guestMode && (
          <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
            Logout
          </button>
        )}
      </div>

      {!profile?.job_title && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Welcome to OneSearch Job!</p>
          <p>
            To get personalized job matches, please{' '}
            <a href="/profile" className="underline">
              {guestMode ? 'create your guest profile' : 'complete your profile'}
            </a>
            .
          </p>
        </div>
      )}

      <JobsFilters onFilterChange={handleFilterChange} />

      {jobsLoading && <p className="text-center">Loading jobs...</p>}
      {matching && <p className="text-center">Calculating matches...</p>}

      {!jobsLoading && !matching && (
        <>
          <div className="space-y-4">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job, index) => <JobCard key={index} job={job} />)
            ) : (
              <p className="text-center text-gray-500">No jobs found.</p>
            )}
          </div>
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="py-2 px-4 bg-gray-300 rounded disabled:opacity-50">
              Previous
            </button>
            <span>Page {page} of {Math.ceil(jobs.length / JOBS_PER_PAGE)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={paginatedJobs.length < JOBS_PER_PAGE} className="py-2 px-4 bg-gray-300 rounded disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
