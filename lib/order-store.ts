// Persists shop order requests to disk, following the same pattern as lib/live-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  customerName: string;
  phone: string;
  memberEmail: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'orders.json');

function readOrders(): Order[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Order[];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

export function getOrders(): Order[] {
  return readOrders().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrderById(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

export function getOrdersByMemberEmail(memberEmail: string): Order[] {
  return getOrders().filter((o) => o.memberEmail === memberEmail);
}

export function createOrder(input: {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  customerName: string;
  phone: string;
  memberEmail: string;
}): Order {
  const orders = readOrders();
  const order: Order = {
    id: randomUUID(),
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  writeOrders(orders);
  return order;
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index] = { ...orders[index], status };
  writeOrders(orders);
  return orders[index];
}

export function deleteOrder(id: string): boolean {
  const orders = readOrders();
  const next = orders.filter((o) => o.id !== id);
  if (next.length === orders.length) return false;
  writeOrders(next);
  return true;
}
