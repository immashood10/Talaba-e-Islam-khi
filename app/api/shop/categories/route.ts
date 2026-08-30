import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { createShopCategory, getShopCategories } from '@/lib/shop-category-store';

export async function GET() {
  return NextResponse.json({ categories: getShopCategories() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json().catch(() => ({}));

  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter a category name' }, { status: 400 });
  }

  const category = createShopCategory({ name: name.trim() });

  return NextResponse.json({ success: true, category }, { status: 201 });
}
