'use client';

import { useState, type MouseEvent } from 'react';
import type { Product } from '@/lib/product-store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => boolean;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const inStock = product.stock > 0;
  const [justAdded, setJustAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');

  const handleAddToCart = () => {
    const added = onAddToCart(product);
    if (!added) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleImageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="card group hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div
        className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl h-52 bg-gray-100 dark:bg-slate-800"
        onMouseMove={handleImageMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- product images are admin-provided arbitrary URLs, not build-time assets */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{ transformOrigin: zoomOrigin }}
          className={`h-full w-full object-contain transition-transform duration-300 ease-out ${isZoomed ? 'scale-150' : 'scale-100'}`}
        />
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-secondary">Out of stock</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-text-light text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
          {inStock && <span className="text-sm text-text-light">{product.stock} in stock</span>}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!inStock ? 'Out of Stock' : justAdded ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
