import ProfileForm from '@/components/forms/ProfileForm';
import { UserProfile } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isGuestMode } from '@/lib/utils/guest';
import { loadProfileFromStorage } from '@/lib/storage';

export default async function ProfilePage() {
  let profile: UserProfile | null = null;

  if (!isGuestMode()) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      profile = data;
    }
  } else {
    // In guest mode, the form will load from local storage on the client
    profile = null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{isGuestMode() ? 'Create Your Guest Profile' : 'Your Profile'}</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
