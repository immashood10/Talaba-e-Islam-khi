import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { findMemberByEmail } from '@/lib/member-store';
import { getStoryById } from '@/lib/story-store';
import { recordStoryView } from '@/lib/story-view-store';

// Records that a viewer opened a story. Logged-in members are recorded under
// their account; guests are recorded under the anonymous id their browser
// generated (see lib/story-seen.ts), so admin still sees a "seen" count.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getStoryById(id);
  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  const email = await getMemberEmailFromRequest(request);
  const member = email ? findMemberByEmail(email) : undefined;

  if (member) {
    recordStoryView({
      storyId: id,
      viewerId: `member:${member.id}`,
      viewerName: member.name,
      viewerEmail: member.email,
    });
    return NextResponse.json({ success: true });
  }

  const { anonymousId } = await request.json().catch(() => ({}));
  if (typeof anonymousId === 'string' && anonymousId.trim()) {
    recordStoryView({
      storyId: id,
      viewerId: `guest:${anonymousId.trim()}`,
      viewerName: 'Guest',
    });
  }

  return NextResponse.json({ success: true });
}
