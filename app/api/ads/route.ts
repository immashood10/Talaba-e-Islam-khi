import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { createAd, getAds } from '@/lib/ad-store';

export async function GET() {
  return NextResponse.json({ ads: getAds() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const ad = createAd({
    advertiserName: advertiserName.trim(),
    imageUrl: imageUrl.trim(),
    linkUrl: linkUrl.trim(),
  });

  return NextResponse.json({ success: true, ad }, { status: 201 });
}
