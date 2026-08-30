import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { deleteAd, updateAd } from '@/lib/ad-store';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { advertiserName, imageUrl, linkUrl } = await request.json().catch(() => ({}));

  if (typeof advertiserName !== 'string' || advertiserName.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter an advertiser name' }, { status: 400 });
  }
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return NextResponse.json({ error: 'Please enter an image URL' }, { status: 400 });
  }
  if (typeof linkUrl !== 'string' || !linkUrl.trim()) {
    return NextResponse.json({ error: 'Please enter a link URL' }, { status: 400 });
  }

  const ad = updateAd(id, {
    advertiserName: advertiserName.trim(),
    imageUrl: imageUrl.trim(),
    linkUrl: linkUrl.trim(),
  });

  if (!ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, ad });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteAd(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
