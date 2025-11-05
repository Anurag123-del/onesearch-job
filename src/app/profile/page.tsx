import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/forms/ProfileForm';
import { UserProfile } from '@/types';

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    profile = data;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
