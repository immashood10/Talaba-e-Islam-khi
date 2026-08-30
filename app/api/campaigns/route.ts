import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { categories } from '@/lib/mock-data';
import { createCampaign, getCampaigns } from '@/lib/campaign-store';
import { validateCampaignInput } from '@/lib/validate-campaign';

export async function GET() {
  const campaigns = getCampaigns();
  return NextResponse.json({ campaigns, categories, total: campaigns.length });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const result = validateCampaignInput(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const campaign = createCampaign(result.data);
  return NextResponse.json({ success: true, campaign }, { status: 201 });
}
