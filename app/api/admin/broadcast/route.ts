import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getIngestInfo, getStreamStatus, isMediamtxReachable } from '@/lib/mediamtx';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reachable = await isMediamtxReachable();
  if (!reachable) {
    return NextResponse.json({ serverRunning: false, status: null, ingest: null });
  }

  const status = await getStreamStatus();
  return NextResponse.json({
    serverRunning: true,
    status,
    ingest: getIngestInfo(),
  });
}
