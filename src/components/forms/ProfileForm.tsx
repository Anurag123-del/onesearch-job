'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { UserProfile } from '@/types';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { WithContext as ReactTags } from 'react-tag-input';
import { useState } from 'react';


const schema = z.object({
  job_title: z.string().min(1, 'Job title is required'),
  yoe: z.coerce.number().min(0, 'Years of experience must be a positive number'),
  skills: z.array(z.object({ id: z.string(), text: z.string() })).min(1, 'Please list at least one skill'),
  preferred_locations: z.array(z.object({ id: z.string(), text: z.string() })).min(1, 'Please list at least one location'),
});

type ProfileFormData = z.infer<typeof schema>;

export default function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_title: profile?.job_title || '',
      yoe: Number(profile?.yoe || 0),
      skills: profile?.skills?.map(s => ({ id: s, text: s })) || [],
      preferred_locations: profile?.preferred_locations?.map(l => ({ id: l, text: l })) || [],
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setStatusMessage('');
    setIsError(false);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatusMessage('Error: User not logged in.');
      setIsError(true);
      return;
    }

    const updatedProfile = {
      user_id: user.id,
      job_title: data.job_title,
      yoe: data.yoe,
      skills: data.skills.map(s => s.text),
      preferred_locations: data.preferred_locations.map(l => l.text),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updatedProfile);

    if (error) {
      console.error(error);
      setStatusMessage('Failed to update profile.');
      setIsError(true);
    } else {
      setStatusMessage('Profile updated successfully!');
      setIsError(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="job_title">Job Title</label>
        <input id="job_title" {...register('job_title')} className="w-full p-2 border rounded" />
        {errors.job_title && <p className="text-red-500">{errors.job_title.message}</p>}
      </div>
      <div>
        <label htmlFor="yoe">Years of Experience</label>
        <input id="yoe" type="number" {...register('yoe')} className="w-full p-2 border rounded" />
        {errors.yoe && <p className="text-red-500">{errors.yoe.message}</p>}
      </div>
      <div>
        <label>Skills</label>
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <ReactTags
              tags={field.value}
              handleDelete={(i) => field.onChange(field.value.filter((_, index) => index !== i))}
              handleAddition={(tag) => field.onChange([...field.value, tag])}
              inputFieldPosition="bottom"
              autocomplete
            />
          )}
        />
        {errors.skills && <p className="text-red-500">{errors.skills.message}</p>}
      </div>
      <div>
        <label>Preferred Locations</label>
        <Controller
          name="preferred_locations"
          control={control}
          render={({ field }) => (
            <ReactTags
              tags={field.value}
              handleDelete={(i) => field.onChange(field.value.filter((_, index) => index !== i))}
              handleAddition={(tag) => field.onChange([...field.value, tag])}
              inputFieldPosition="bottom"
              autocomplete
            />
          )}
        />
        {errors.preferred_locations && <p className="text-red-500">{errors.preferred_locations.message}</p>}
      </div>

      {statusMessage && (
        <p className={isError ? 'text-red-500' : 'text-green-500'}>{statusMessage}</p>
      )}

      <button type="submit" disabled={isSubmitting} className="p-2 bg-blue-500 text-white rounded">
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
