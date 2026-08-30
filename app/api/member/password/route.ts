import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { findMemberByEmail, hashPassword, updateMemberPassword, verifyPassword } from '@/lib/member-store';

export async function POST(request: NextRequest) {
  const email = await getMemberEmailFromRequest(request);
  const member = email ? findMemberByEmail(email) : undefined;
  if (!member) {
    return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));

  const hasExistingPassword = Boolean(member.salt && member.hash);
  if (hasExistingPassword) {
    if (typeof currentPassword !== 'string' || !verifyPassword(currentPassword, member.salt!, member.hash!)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
  }

  const { salt, hash } = hashPassword(newPassword);
  updateMemberPassword(member.id, salt, hash);

  return NextResponse.json({ success: true });
}
