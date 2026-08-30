import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, getMemberEmailFromRequest } from '@/lib/auth';
import { decrementStock, getProductById } from '@/lib/product-store';
import { createOrder, getOrders } from '@/lib/order-store';
import { createNotification } from '@/lib/notification-store';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ orders: getOrders() });
}

export async function POST(request: NextRequest) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Please log in to place an order' }, { status: 401 });
  }

  const { productId, quantity, customerName, phone } = await request.json().catch(() => ({}));

  if (typeof productId !== 'string' || !productId) {
    return NextResponse.json({ error: 'Missing product' }, { status: 400 });
  }
  if (typeof customerName !== 'string' || customerName.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });
  }
  if (typeof phone !== 'string' || phone.trim().length < 7) {
    return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: 'Please enter a valid quantity' }, { status: 400 });
  }

  const product = getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: 'This product is no longer available' }, { status: 404 });
  }
  if (quantity > product.stock) {
    return NextResponse.json({ error: `Only ${product.stock} left in stock` }, { status: 400 });
  }

  const order = createOrder({
    productId: product.id,
    productName: product.name,
    unitPrice: product.price,
    quantity,
    customerName: customerName.trim(),
    phone: phone.trim(),
    memberEmail,
  });
  decrementStock(product.id, quantity);
  createNotification(`${order.customerName} ordered ${order.quantity} × ${order.productName} (Rs. ${(order.unitPrice * order.quantity).toLocaleString()})`);

  return NextResponse.json({ success: true, order }, { status: 201 });
}
