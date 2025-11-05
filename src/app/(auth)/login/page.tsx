'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
});

export default function LoginPage() {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    setMessage('');
    setIsError(false);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setMessage('Failed to send magic link. Please try again.');
      setIsError(true);
    } else {
      setMessage('Check your email for the magic link!');
      setIsError(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full max-w-sm">
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
        />
        {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}

        {message && (
          <p className={`mt-2 ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="p-2 mt-2 bg-blue-500 text-white rounded">
          {isSubmitting ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}
