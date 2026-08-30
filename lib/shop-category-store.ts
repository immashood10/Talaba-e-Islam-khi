// Persists shop categories to disk, following the same pattern as lib/product-store.ts.
// Server-only - never import this from a client component.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { getProducts, updateProduct } from './product-store';

export interface ShopCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'shop-categories.json');

function readCategories(): ShopCategory[] {
  try {
    if (!existsSync(FILE_PATH)) return [];
    return JSON.parse(readFileSync(FILE_PATH, 'utf-8')) as ShopCategory[];
  } catch {
    return [];
  }
}

function writeCategories(categories: ShopCategory[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(categories, null, 2), 'utf-8');
}

export function getShopCategories(): ShopCategory[] {
  return readCategories().sort((a, b) => a.name.localeCompare(b.name));
}

export function getShopCategoryById(id: string): ShopCategory | undefined {
  return readCategories().find((c) => c.id === id);
}

export function createShopCategory(input: { name: string }): ShopCategory {
  const categories = readCategories();
  const now = new Date().toISOString();
  const category: ShopCategory = {
    id: randomUUID(),
    name: input.name,
    createdAt: now,
    updatedAt: now,
  };
  categories.push(category);
  writeCategories(categories);
  return category;
}

export function updateShopCategory(id: string, updates: { name: string }): ShopCategory | null {
  const categories = readCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  categories[index] = { ...categories[index], ...updates, updatedAt: new Date().toISOString() };
  writeCategories(categories);
  return categories[index];
}

export function deleteShopCategory(id: string): boolean {
  const categories = readCategories();
  const next = categories.filter((c) => c.id !== id);
  if (next.length === categories.length) return false;
  writeCategories(next);

  getProducts()
    .filter((product) => product.categoryId === id)
    .forEach((product) => {
      updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        categoryId: undefined,
      });
    });

  return true;
}
