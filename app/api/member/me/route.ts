import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest, isAdminRequest } from '@/lib/auth';
import { findMemberByEmail, toPublicMember } from '@/lib/member-store';

export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  const email = await getMemberEmailFromRequest(request);

  if (!email) return NextResponse.json({ member: null, isAdmin });

  const member = findMemberByEmail(email);
  if (!member) return NextResponse.json({ member: null, isAdmin });

  return NextResponse.json({ member: toPublicMember(member), isAdmin });
}
