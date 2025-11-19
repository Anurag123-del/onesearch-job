import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendDigestEmail } from '@/lib/email/sendDigest';
import { NormalizedJob } from '@/types';
import { NextResponse } from 'next/server';
import { isGuestMode } from '@/lib/utils/guest';

export async function POST() {
    if (isGuestMode()) {
        return NextResponse.json({ message: 'Digest emails are disabled in guest mode.' });
    }

    const supabase = createSupabaseServerClient();
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, user:users(email)');

    if (error) {
        console.error('Error fetching profiles:', error);
        return new Response('Error fetching profiles.', { status: 500 });
    }

    for (const profile of profiles) {
        const userEmail = profile.user.email;
        if (userEmail) {
            // This is a placeholder for the actual job matching logic
            const { data: jobs } = await supabase
                .from('jobs')
                .select('*')
                .limit(10);

            await sendDigestEmail(userEmail, profile, jobs as (NormalizedJob & { score: number})[]);
        }
    }

    return NextResponse.json({ message: 'Digest emails sent.' });
}
