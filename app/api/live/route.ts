import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getLivePost, setLivePost } from '@/lib/live-store';
import { toEmbeddableUrl } from '@/lib/video-embed';

export async function GET() {
  return NextResponse.json({ live: getLivePost() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const rawStreamUrl = typeof body?.streamUrl === 'string' ? body.streamUrl.trim() : '';
  const isActive = Boolean(body?.isActive);

  if (!title || !rawStreamUrl) {
    return NextResponse.json({ error: 'Title and stream URL are required' }, { status: 400 });
  }

  const streamUrl = toEmbeddableUrl(rawStreamUrl);
  const live = setLivePost({ title, description, streamUrl, isActive });
  return NextResponse.json({ live });
}
