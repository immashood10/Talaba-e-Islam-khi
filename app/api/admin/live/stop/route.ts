import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getStreamStatus, kickPublisher } from '@/lib/mediamtx';
import { getLivePost, setLivePost } from '@/lib/live-store';

// Ends whatever is currently live: kicks the publisher off the MediaMTX
// broadcast and/or deactivates the manually posted stream link.
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let kickedBroadcast = false;
  const status = await getStreamStatus();
  if (status.isLive) {
    kickedBroadcast = await kickPublisher();
  }

  let deactivatedPost = false;
  const post = getLivePost();
  if (post?.isActive) {
    setLivePost({ ...post, isActive: false });
    deactivatedPost = true;
  }

  return NextResponse.json({ success: true, kickedBroadcast, deactivatedPost });
}
