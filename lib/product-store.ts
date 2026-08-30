// Persists shop products to disk, following the same pattern as lib/live-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'products.json');

function readProducts(): Product[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as Product[];
  } catch {
    return [];
  }
}

function writeProducts(products: Product[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

export function getProducts(): Product[] {
  return readProducts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProductById(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

export function createProduct(input: { name: string; description: string; price: number; image: string; stock: number; categoryId?: string }): Product {
  const products = readProducts();
  const now = new Date().toISOString();
  const product: Product = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    price: input.price,
    image: input.image,
    stock: input.stock,
    categoryId: input.categoryId,
    createdAt: now,
    updatedAt: now,
  };
  products.push(product);
  writeProducts(products);
  return product;
}

export function updateProduct(
  id: string,
  updates: { name: string; description: string; price: number; image: string; stock: number; categoryId?: string },
): Product | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
  writeProducts(products);
  return products[index];
}

export function decrementStock(id: string, quantity: number): Product | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    stock: Math.max(0, products[index].stock - quantity),
    updatedAt: new Date().toISOString(),
  };
  writeProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  writeProducts(next);
  return true;
}
