import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { deleteStory, updateStory } from '@/lib/story-store';
import { deleteViewsForStory } from '@/lib/story-view-store';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { mediaUrl, mediaType, caption } = await request.json().catch(() => ({}));

  if (typeof mediaUrl !== 'string' || !mediaUrl.trim()) {
    return NextResponse.json({ error: 'Please upload an image or video for the story' }, { status: 400 });
  }
  if (mediaType !== 'image' && mediaType !== 'video') {
    return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
  }
  if (caption !== undefined && typeof caption !== 'string') {
    return NextResponse.json({ error: 'Invalid caption' }, { status: 400 });
  }

  const story = updateStory(id, {
    mediaUrl: mediaUrl.trim(),
    mediaType,
    caption: caption?.trim() || undefined,
  });

  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, story });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteStory(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  deleteViewsForStory(id);
  return NextResponse.json({ success: true });
}
