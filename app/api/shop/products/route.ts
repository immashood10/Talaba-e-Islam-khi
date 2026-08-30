import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { createProduct, getProducts } from '@/lib/product-store';

export async function GET() {
  return NextResponse.json({ products: getProducts() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, price, image, stock, categoryId } = await request.json().catch(() => ({}));

  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter a product name' }, { status: 400 });
  }
  if (typeof description !== 'string' || description.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter a description' }, { status: 400 });
  }
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'Please enter a valid price' }, { status: 400 });
  }
  if (typeof image !== 'string' || !image.trim()) {
    return NextResponse.json({ error: 'Please enter an image URL' }, { status: 400 });
  }
  if (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0) {
    return NextResponse.json({ error: 'Please enter a valid stock quantity' }, { status: 400 });
  }
  if (categoryId !== undefined && typeof categoryId !== 'string') {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const product = createProduct({
    name: name.trim(),
    description: description.trim(),
    price,
    image: image.trim(),
    stock,
    categoryId: categoryId || undefined,
  });

  return NextResponse.json({ success: true, product }, { status: 201 });
}
