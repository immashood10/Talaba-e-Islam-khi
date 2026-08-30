'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Product } from '@/lib/product-store';
import type { Order } from '@/lib/order-store';
import type { ShopCategory } from '@/lib/shop-category-store';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  image: string;
  stock: string;
  categoryId: string;
}

const emptyForm: ProductFormState = { name: '', description: '', price: '', image: '', stock: '', categoryId: '' };

export default function AdminShopPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryFormError, setCategoryFormError] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/shop/products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/shop/orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/shop/categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const openAddForm = () => {
    setEditingProductId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image: product.image,
      stock: String(product.stock),
      categoryId: product.categoryId || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const openAddCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryFormError('');
    setShowCategoryForm(true);
  };

  const openEditCategoryForm = (category: ShopCategory) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryFormError('');
    setShowCategoryForm(true);
  };

  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryFormError('');
  };

  const handleCategoryFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCategoryFormError('');
    setIsSavingCategory(true);

    try {
      const res = await fetch(editingCategoryId ? `/api/shop/categories/${editingCategoryId}` : '/api/shop/categories', {
        method: editingCategoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCategoryFormError(data.error || 'Could not save category');
        return;
      }

      await fetchCategories();
      closeCategoryForm();
    } catch {
      setCategoryFormError('Something went wrong. Please try again.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    await fetch(`/api/shop/categories/${id}`, { method: 'DELETE' });
    await fetchCategories();
    await fetchProducts();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProductId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleImageUpload = async (file: File) => {
    setFormError('');
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not upload image');
        return;
      }

      setForm((f) => ({ ...f, image: data.url }));
    } catch {
      setFormError('Could not upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);

    if (Number.isNaN(price) || price < 0) {
      setFormError('Please enter a valid price');
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      setFormError('Please enter a valid stock quantity');
      return;
    }
    if (!form.image.trim()) {
      setFormError('Please upload an image or paste an image URL');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price,
        image: form.image,
        stock,
        categoryId: form.categoryId || undefined,
      };
      const res = await fetch(editingProductId ? `/api/shop/products/${editingProductId}` : '/api/shop/products', {
        method: editingProductId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Could not save product');
        return;
      }

      await fetchProducts();
      closeForm();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await fetch(`/api/shop/products/${id}`, { method: 'DELETE' });
    await fetchProducts();
  };

  const toggleOrderStatus = async (order: Order) => {
    const nextStatus = order.status === 'pending' ? 'fulfilled' : 'pending';
    await fetch(`/api/shop/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    await fetchOrders();
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Delete this order request?')) return;
    await fetch(`/api/shop/orders/${id}`, { method: 'DELETE' });
    await fetchOrders();
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-2">Shop</h1>
          <p className="text-text-light">Manage products and order requests</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'products' ? 'text-primary' : 'text-text-light hover:text-secondary'
            }`}
          >
            Products ({products.length})
            {activeTab === 'products' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'categories' ? 'text-primary' : 'text-text-light hover:text-secondary'
            }`}
          >
            Categories ({categories.length})
            {activeTab === 'categories' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'orders' ? 'text-primary' : 'text-text-light hover:text-secondary'
            }`}
          >
            Orders ({orders.length})
            {activeTab === 'orders' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
        </div>

        {activeTab === 'products' ? (
          <div>
            <div className="mb-6 flex justify-end">
              {!showForm && (
                <button onClick={openAddForm} className="btn-primary">
                  + Add Product
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleFormSubmit} className="card mb-8">
                <h2 className="mb-4 text-xl font-semibold text-secondary">
                  {editingProductId ? 'Edit Product' : 'New Product'}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="mb-4">
                    <label htmlFor="product-name" className="mb-2 block text-sm font-medium text-secondary">
                      Name
                    </label>
                    <input
                      id="product-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="product-price" className="mb-2 block text-sm font-medium text-secondary">
                      Price (Rs.)
                    </label>
                    <input
                      id="product-price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="product-description" className="mb-2 block text-sm font-medium text-secondary">
                    Description
                  </label>
                  <textarea
                    id="product-description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="input-field resize-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-secondary">Image</label>

                  {form.image ? (
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image */}
                      <img src={form.image} alt="Product preview" className="h-32 w-32 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image: '' }))}
                        className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="product-image-upload" className="mb-1 block text-xs text-text-light">
                        Upload from your computer
                      </label>
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="input-field"
                        disabled={isUploading}
                      />
                      {isUploading && <p className="mt-2 text-sm text-text-light">Uploading...</p>}

                      <label htmlFor="product-image" className="mb-1 mt-3 block text-xs text-text-light">
                        Or paste an image URL
                      </label>
                      <input
                        id="product-image"
                        type="url"
                        value={form.image}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                        className="input-field"
                        placeholder="https://..."
                      />
                    </>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="mb-4">
                    <label htmlFor="product-stock" className="mb-2 block text-sm font-medium text-secondary">
                      Stock quantity
                    </label>
                    <input
                      id="product-stock"
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="product-category" className="mb-2 block text-sm font-medium text-secondary">
                      Category
                    </label>
                    <select
                      id="product-category"
                      value={form.categoryId}
                      onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{formError}</p>}

                <div className="flex gap-3">
                  <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
                    {isSaving ? 'Saving...' : editingProductId ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isLoadingProducts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-2xl font-bold text-secondary mb-2">No products yet</h3>
                <p className="text-text-light">Add your first product to get the shop started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary image URL */}
                      <img src={product.image} alt={product.name} className="h-16 w-16 shrink-0 rounded-lg object-contain bg-gray-100" />
                      <div className="min-w-0">
                        <p className="font-bold text-secondary truncate">{product.name}</p>
                        <p className="text-sm text-text-light truncate">{product.description}</p>
                        <p className="text-sm text-primary font-semibold mt-1">
                          Rs. {product.price.toLocaleString()} · {product.stock} in stock
                          {product.categoryId && (
                            <> · {categories.find((c) => c.id === product.categoryId)?.name || 'Uncategorized'}</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => openEditForm(product)} className="btn-secondary px-4 py-2 text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'categories' ? (
          <div>
            <div className="mb-6 flex justify-end">
              {!showCategoryForm && (
                <button onClick={openAddCategoryForm} className="btn-primary">
                  + Add Category
                </button>
              )}
            </div>

            {showCategoryForm && (
              <form onSubmit={handleCategoryFormSubmit} className="card mb-8">
                <h2 className="mb-4 text-xl font-semibold text-secondary">
                  {editingCategoryId ? 'Edit Category' : 'New Category'}
                </h2>

                <div className="mb-4">
                  <label htmlFor="category-name" className="mb-2 block text-sm font-medium text-secondary">
                    Name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Books"
                    required
                  />
                </div>

                {categoryFormError && <p className="mb-4 text-sm text-red-500 animate-fade-in">{categoryFormError}</p>}

                <div className="flex gap-3">
                  <button type="submit" disabled={isSavingCategory} className="btn-primary disabled:opacity-60">
                    {isSavingCategory ? 'Saving...' : editingCategoryId ? 'Save Changes' : 'Add Category'}
                  </button>
                  <button type="button" onClick={closeCategoryForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isLoadingCategories ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏷️</div>
                <h3 className="text-2xl font-bold text-secondary mb-2">No categories yet</h3>
                <p className="text-text-light">Add a category to help shoppers filter products.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-secondary">{category.name}</p>
                      <p className="text-sm text-text-light">
                        {products.filter((p) => p.categoryId === category.id).length} product(s)
                      </p>
                    </div>

                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => openEditCategoryForm(category)} className="btn-secondary px-4 py-2 text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-secondary mb-2">No order requests yet</h3>
                <p className="text-text-light">Orders placed from the Shop page will show up here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-soft flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-secondary">
                        {order.quantity} × {order.productName}
                      </p>
                      <p className="text-sm text-text-light">
                        {order.customerName} · {order.phone}
                      </p>
                      <p className="text-sm text-primary font-semibold mt-1">
                        Rs. {(order.unitPrice * order.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-text-light mt-2">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === 'fulfilled'
                            ? 'bg-primary/10 text-primary'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status === 'fulfilled' ? 'Fulfilled' : order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                      </span>
                      {order.status !== 'cancelled' && (
                        <button onClick={() => toggleOrderStatus(order)} className="btn-secondary px-4 py-2 text-sm">
                          Mark {order.status === 'pending' ? 'Fulfilled' : 'Pending'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
