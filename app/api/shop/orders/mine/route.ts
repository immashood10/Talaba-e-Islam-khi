import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { getOrdersByMemberEmail } from '@/lib/order-store';

export async function GET(request: NextRequest) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ orders: getOrdersByMemberEmail(memberEmail) });
}
