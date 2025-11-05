import { NextRequest, NextResponse } from 'next/server';
import { GET as sendDigest } from '@/app/api/cron/digest/route';

export async function POST(req: NextRequest) {
  const authToken = req.headers.get('x-admin-token');
  if (authToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return sendDigest();
}
