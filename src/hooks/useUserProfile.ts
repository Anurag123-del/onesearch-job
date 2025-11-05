import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserProfile } from '@/types';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
}
