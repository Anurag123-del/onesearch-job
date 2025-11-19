'use client';
import ProfileForm from "@/components/forms/ProfileForm";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfilePage() {
    const { profile, loading } = useUserProfile();

    if (loading) {
        return <p className="text-center p-8">Loading profile...</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            <ProfileForm profile={profile} />
        </div>
    );
}
