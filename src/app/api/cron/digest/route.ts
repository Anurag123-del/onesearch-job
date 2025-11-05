import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendDigestEmail } from '@/lib/email/sendDigest';
import { UserProfile, JobItem } from '@/types';
import { NextResponse } from 'next/server';

type JobWithScore = JobItem & { score?: number };

// Simple server-side keyword scoring as a fallback for the daily digest
const scoreJobServerSide = (profile: UserProfile, job: JobItem): number => {
  let score = 0;
  const profileKeywords = new Set([
    ...profile.job_title.toLowerCase().split(' '),
    ...(profile.skills?.map(s => s.toLowerCase()) || []),
  ]);

  const jobText = `${job.title?.toLowerCase()} ${job.description?.toLowerCase()}`;

  for (const keyword of profileKeywords) {
    if (jobText.includes(keyword)) {
      score += 1;
    }
  }

  // Boost for location
  if (job.location && profile.preferred_locations?.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()))) {
    score += 5;
  }

  return score;
};


export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(500); // Get a recent batch of jobs

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  let emailsSent = 0;

  for (const user of users.users) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Only send digests to users with a complete profile
    if (profile && profile.job_title && user.email) {
      const jobsWithScores: JobWithScore[] = jobs
        .map(job => ({
          ...job,
          score: scoreJobServerSide(profile, job),
        }))
        .filter(job => job.score && job.score > 0);

      jobsWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));

      const top10Jobs = jobsWithScores.slice(0, 10);

      if (top10Jobs.length > 0) {
        await sendDigestEmail(user.email, profile, top10Jobs);
        emailsSent++;
      }
    }
  }

  return NextResponse.json({ message: `Sent digest emails to ${emailsSent} users.` });
}
