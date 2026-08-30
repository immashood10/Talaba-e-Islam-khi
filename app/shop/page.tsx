'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import MembershipModal from '@/components/MembershipModal';
import { useCart } from '@/lib/cart-context';
import { useMember } from '@/lib/member-context';
import type { Product } from '@/lib/product-store';
import type { ShopCategory } from '@/lib/shop-category-store';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { member } = useMember();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/shop/products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/shop/categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : selectedCategory === 'uncategorized'
        ? products.filter((p) => !p.categoryId)
        : products.filter((p) => p.categoryId === selectedCategory);

  const handleAddToCart = (product: Product): boolean => {
    if (!member) {
      setIsMemberModalOpen(true);
      return false;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    return true;
  };

  const hasUncategorized = products.some((p) => !p.categoryId);

  const categoryButtonClass = (id: string) =>
    `shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-left font-medium transition-all duration-200 lg:whitespace-normal ${
      selectedCategory === id
        ? 'bg-primary text-white shadow-glow'
        : 'bg-white text-text-light hover:bg-primary/10 hover:text-primary border border-gray-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-4">Shop</h1>
            <p className="text-lg text-text-light">Support us by picking up something from our shop</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {categories.length > 0 && (
              <aside className="lg:w-56 shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0">
                  <button onClick={() => setSelectedCategory('all')} className={categoryButtonClass('all')}>
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={categoryButtonClass(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                  {hasUncategorized && (
                    <button onClick={() => setSelectedCategory('uncategorized')} className={categoryButtonClass('uncategorized')}>
                      Other
                    </button>
                  )}
                </div>
              </aside>
            )}

            <div className="flex-1">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="h-52 bg-gray-200 rounded-t-xl mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">No products yet</h3>
                  <p className="text-text-light">Check back soon — new items are on the way.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">No products in this category</h3>
                  <p className="text-text-light">Check back soon or browse another category.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="opacity-0 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <MembershipModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} />
    </div>
  );
}
