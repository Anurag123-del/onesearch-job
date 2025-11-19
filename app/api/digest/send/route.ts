import { POST as sendDigest } from '@/app/api/cron/digest/route';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Await the cron function and return its response
  return await sendDigest();
}
