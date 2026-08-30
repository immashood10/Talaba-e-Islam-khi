import { NextRequest, NextResponse } from 'next/server';
import { getMemberEmailFromRequest } from '@/lib/auth';
import { getOrderById, updateOrderStatus } from '@/lib/order-store';
import { createNotification } from '@/lib/notification-store';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberEmail = await getMemberEmailFromRequest(request);
  if (!memberEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const order = getOrderById(id);

  if (!order || order.memberEmail !== memberEmail) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
  }

  const updated = updateOrderStatus(id, 'cancelled');
  createNotification(
    `${order.customerName} has cancelled their order for ${order.quantity} × ${order.productName}`,
  );

  return NextResponse.json({ success: true, order: updated });
}
