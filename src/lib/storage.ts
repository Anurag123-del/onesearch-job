import { UserProfile } from '@/types';

const PROFILE_KEY = 'onesearch_profile_v1';

export function saveProfileToStorage(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

export function loadProfileFromStorage(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const profileJson = window.localStorage.getItem(PROFILE_KEY);
    if (profileJson) {
      return JSON.parse(profileJson);
    }
  }
  return null;
}
