import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { createStory, getActiveStories, getAllStories, type Story } from '@/lib/story-store';
import { getViewCounts, getViewsForStory, type StoryView } from '@/lib/story-view-store';

export interface AdminStory extends Story {
  viewCount: number;
  views: StoryView[];
}

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);

  if (!isAdmin) {
    return NextResponse.json({ stories: getActiveStories() });
  }

  const counts = getViewCounts();
  const stories: AdminStory[] = getAllStories().map((story) => ({
    ...story,
    viewCount: counts[story.id] ?? 0,
    views: getViewsForStory(story.id),
  }));

  return NextResponse.json({ stories });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const story = createStory({
    mediaUrl: mediaUrl.trim(),
    mediaType,
    caption: caption?.trim() || undefined,
  });

  return NextResponse.json({ success: true, story }, { status: 201 });
}
