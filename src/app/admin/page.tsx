'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Pill,
  Package,
  LayoutDashboard,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Tag,
  Phone,
  MapPin,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Users,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Key,
} from 'lucide-react';
import Link from 'next/link';

// Main Admin Console Component
function AdminConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout } = useAuth();

  // Tab State: 'dashboard' | 'products' | 'orders' | 'users'
  const initialTab = (searchParams.get('tab') as 'dashboard' | 'products' | 'orders' | 'users') || 'dashboard';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>(initialTab);


  // Sync tab with URL without page reload
  const handleTabChange = (tab: 'dashboard' | 'products' | 'orders' | 'users') => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `/admin?tab=${tab}`);
  };

  // Auth protection
  useEffect(() => {
    if (!authLoading) {
      if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(user.role)) {
        router.push('/auth/login?redirect=/admin');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-slate-300">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400 mx-auto mb-3" />
          <p className="text-xs font-semibold">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100">
      {/* ================= PERSISTENT STATIC SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen p-4 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="px-3.5 py-3 bg-slate-800/90 rounded-2xl border border-slate-700">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-teal-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Website Admin Panel
            </div>
            <div className="text-sm font-bold text-white truncate mt-0.5">
              {user.fullName}
            </div>
            <div className="text-[11px] text-slate-400">
              Role: <span className="text-amber-400 font-semibold">{user.role}</span>
            </div>
          </div>

          {/* Navigation Buttons (Zero page reload) */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* 1. OVERVIEW DASHBOARD AT TOP */}
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left ${
                activeTab === 'dashboard'
                  ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-700/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Overview Dashboard</span>
            </button>

            {/* 2. PRODUCTS & DISCOUNTS */}
            <button
              onClick={() => handleTabChange('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left ${
                activeTab === 'products'
                  ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-700/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Pill className="w-4 h-4 text-teal-400" />
              <span>Products &amp; Discounts</span>
            </button>

            {/* 3. ORDER MANAGEMENT */}
            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left ${
                activeTab === 'orders'
                  ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-700/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4 text-blue-400" />
              <span>Order Management</span>
            </button>

            {/* 4. USERS & CUSTOMERS */}
            <button
              onClick={() => handleTabChange('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left ${
                activeTab === 'users'
                  ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-700/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Users &amp; Customers</span>
            </button>
          </nav>
        </div>

        {/* Footer / Exit Links */}
        <div className="pt-4 border-t border-slate-800 space-y-2 mt-6 md:mt-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition px-3.5 py-2 rounded-xl hover:bg-slate-800"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              View Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full text-left text-xs font-bold text-rose-400 hover:text-rose-300 transition px-3.5 py-2 rounded-xl hover:bg-slate-800"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= DYNAMIC MAIN CONTENT PANEL ================= */}
      {/* Only this panel switches when a button is clicked — no page reload! */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'dashboard' && <AdminDashboardPanel onNavigateTab={handleTabChange} />}
        {activeTab === 'products' && <AdminProductsPanel />}
        {activeTab === 'orders' && <AdminOrdersPanel />}
        {activeTab === 'users' && <AdminUsersPanel />}
      </main>
    </div>
  );
}

// =========================================================================
// 1. PRODUCTS & DISCOUNTS MANAGEMENT PANEL
// =========================================================================
function AdminProductsPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingProduct, setCurrentEditingProduct] = useState<any | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formDiscountPercent, setFormDiscountPercent] = useState('');
  const [formStock, setFormStock] = useState('100');
  const [formImages, setFormImages] = useState<string[]>(['', '', '', '', '']);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsTopProduct, setFormIsTopProduct] = useState(false);
  const [formTopCategory, setFormTopCategory] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Form Validation & Notification States
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const handleImageChange = (index: number, val: string) => {
    const updated = [...formImages];
    updated[index] = val;
    setFormImages(updated);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Kripya valid image file select karein (JPG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image ka size 10MB se zyada hai. Kripya choti size ki photo upload karein.');
      return;
    }

    setUploadingIdx(index);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        handleImageChange(index, data.url);
      } else {
        // Fallback: convert to base64 Data URL so upload never fails
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            handleImageChange(index, reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback: convert to base64 Data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleImageChange(index, reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIdx(null);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    handleImageChange(index, '');
  };

  const validateProductForm = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) {
      errors.name = 'Product Name / Title bharna anivarya hai';
    }
    if (!formCategoryId) {
      errors.category = 'Category select karna anivarya hai';
    }
    if (!formDescription.trim()) {
      errors.description = 'Product Description likhna zaroori hai';
    }
    const mrp = Number(formMrp);
    const sp = Number(formSellingPrice);
    if (!formMrp || isNaN(mrp) || mrp <= 0) {
      errors.mrp = 'Original MRP ₹0 se bada hona chahiye';
    }
    if (!formSellingPrice || isNaN(sp) || sp <= 0) {
      errors.sellingPrice = 'Selling Price ₹0 se bada hona chahiye';
    } else if (mrp > 0 && sp > mrp) {
      errors.sellingPrice = 'Selling Price MRP se zyada nahi ho sakti';
    }
    if (formIsTopProduct && !formTopCategory) {
      errors.topCategory = 'Top Product ke liye Navbar Category select karein';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errList = Object.values(errors).join(' • ');
      setFormError(`Kripya in fields ko theek karein: ${errList}`);
      return false;
    }

    setFormError(null);
    return true;
  };

  const fetchProducts = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCategories(cData.categories || []);
        if (cData.categories?.length > 0 && !formCategoryId) {
          setFormCategoryId(cData.categories[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleMrpChange = (val: string) => {
    setFormMrp(val);
    if (fieldErrors.mrp) setFieldErrors((prev) => ({ ...prev, mrp: '' }));
    const mrpNum = parseFloat(val);
    const spNum = parseFloat(formSellingPrice);
    const discNum = parseFloat(formDiscountPercent);

    if (!isNaN(mrpNum) && mrpNum > 0) {
      if (!isNaN(spNum) && spNum > 0) {
        // If selling price is already present, calculate discount %
        if (mrpNum >= spNum) {
          const disc = Math.round(((mrpNum - spNum) / mrpNum) * 100);
          setFormDiscountPercent(disc > 0 ? disc.toString() : '0');
        }
      } else if (!isNaN(discNum) && discNum > 0) {
        // If discount is given, calculate selling price
        const sp = Math.max(0, Math.round(mrpNum * (1 - discNum / 100)));
        setFormSellingPrice(sp.toString());
      }
    }
  };

  const handleDiscountPercentChange = (val: string) => {
    setFormDiscountPercent(val);
    const mrpNum = parseFloat(formMrp);
    const discNum = parseFloat(val);
    if (!isNaN(mrpNum) && mrpNum > 0) {
      if (!isNaN(discNum) && discNum >= 0 && discNum <= 100) {
        const sp = Math.max(0, Math.round(mrpNum * (1 - discNum / 100)));
        setFormSellingPrice(sp.toString());
        if (fieldErrors.sellingPrice) setFieldErrors((prev) => ({ ...prev, sellingPrice: '' }));
      }
    }
  };

  const handleSellingPriceChange = (val: string) => {
    setFormSellingPrice(val);
    if (fieldErrors.sellingPrice) setFieldErrors((prev) => ({ ...prev, sellingPrice: '' }));
    const mrpNum = parseFloat(formMrp);
    const spNum = parseFloat(val);
    if (!isNaN(mrpNum) && !isNaN(spNum) && mrpNum > 0) {
      if (mrpNum >= spNum) {
        const disc = Math.round(((mrpNum - spNum) / mrpNum) * 100);
        setFormDiscountPercent(disc > 0 ? disc.toString() : '0');
      } else {
        setFormDiscountPercent('0');
      }
    }
  };

  const openAddModal = () => {
    setFormError(null);
    setFormSuccess(null);
    setFieldErrors({});
    setFormName('');
    setFormDescription('');
    setFormMrp('500');
    setFormDiscountPercent('20');
    setFormSellingPrice('400');
    setFormStock('100');
    setFormImages([
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop',
      '',
      '',
      '',
      '',
    ]);
    setFormIsActive(true);
    setFormIsTopProduct(false);
    if (categories.length > 0) {
      setFormCategoryId(categories[0].id);
      setFormTopCategory(categories[0].id);
    }
    setShowAddModal(true);
  };

  const openEditModal = (p: any) => {
    setFormError(null);
    setFormSuccess(null);
    setFieldErrors({});
    setCurrentEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description || '');
    setFormCategoryId(p.categoryId);
    setFormTopCategory(p.categoryId);
    const mrpRupees = p.mrp / 100;
    const spRupees = p.sellingPrice / 100;
    setFormMrp(mrpRupees.toString());
    setFormSellingPrice(spRupees.toString());
    const disc = mrpRupees > 0 ? Math.round(((mrpRupees - spRupees) / mrpRupees) * 100) : 0;
    setFormDiscountPercent(disc > 0 ? disc.toString() : '0');
    setFormStock(p.stock.toString());
    setFormIsActive(p.isActive);
    setFormIsTopProduct(Boolean(p.isFeatured));

    let imgList: string[] = [];
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed)) imgList = parsed.filter(Boolean);
      else if (typeof parsed === 'string') imgList = [parsed];
    } catch {
      if (p.images) imgList = [p.images];
    }
    while (imgList.length < 5) imgList.push('');
    setFormImages(imgList.slice(0, 5));
    setShowEditModal(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) {
      return;
    }

    const finalImages = formImages.map((s) => s.trim()).filter(Boolean);
    const targetCatId = formIsTopProduct && formTopCategory ? formTopCategory : formCategoryId;

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          categoryId: targetCatId,
          description: formDescription,
          mrp: Number(formMrp),
          sellingPrice: Number(formSellingPrice),
          stock: Number(formStock),
          images: finalImages,
          isActive: formIsActive,
          isFeatured: formIsTopProduct,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Product safalta-purvak add ho gaya!');
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccess(null);
        }, 1000);
        await fetchProducts();
      } else {
        setFormError(data.error || 'Product add karne me error aayi.');
      }
    } catch (e: any) {
      setFormError(e.message || 'Server error aayi. Kripya check karein.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingProduct) return;
    if (!validateProductForm()) {
      return;
    }

    const finalImages = formImages.map((s) => s.trim()).filter(Boolean);
    const targetCatId = formIsTopProduct && formTopCategory ? formTopCategory : formCategoryId;

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentEditingProduct.id,
          name: formName,
          categoryId: targetCatId,
          description: formDescription,
          mrp: Number(formMrp),
          sellingPrice: Number(formSellingPrice),
          stock: Number(formStock),
          images: finalImages,
          isActive: formIsActive,
          isFeatured: formIsTopProduct,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Product safalta-purvak update ho gaya!');
        setTimeout(() => {
          setShowEditModal(false);
          setFormSuccess(null);
        }, 1000);
        await fetchProducts();
      } else {
        setFormError(data.error || 'Product update karne me error aayi.');
      }
    } catch (e: any) {
      setFormError(e.message || 'Server error aayi. Kripya check karein.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (product: any) => {
    try {
      const newStatus = !product.isActive;
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          isActive: newStatus,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p))
        );
      } else {
        alert('Failed to update product visibility');
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete product');
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Pill className="w-7 h-7 text-teal-700" />
            Product Catalog &amp; Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add products, set descriptions, configure discounts, and control store visibility.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Total Products</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{products.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Live on Store</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {products.filter((p) => p.isActive).length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Hidden Products</div>
          <div className="text-2xl font-black text-slate-400 mt-1">
            {products.filter((p) => !p.isActive).length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Out of Stock</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {products.filter((p) => p.stock <= 0).length}
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search products by title, category, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">MRP</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Store Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const mrpVal = p.mrp / 100;
                const spVal = p.sellingPrice / 100;
                const discountPct = mrpVal > 0 ? Math.round(((mrpVal - spVal) / mrpVal) * 100) : 0;
                let firstImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop';
                try {
                  const parsed = JSON.parse(p.images);
                  if (Array.isArray(parsed) && parsed.length > 0) firstImg = parsed[0];
                } catch {}

                return (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={firstImg}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white"
                        />
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-teal-700 flex items-center gap-1 line-clamp-1"
                            >
                              {p.name}
                              <ExternalLink className="w-3 h-3 text-slate-400 opacity-60" />
                            </Link>
                            {p.isFeatured && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9px] px-1.5 py-0.5 rounded-md">
                                ★ Top Product
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {p.category?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-400 line-through">
                      ₹{mrpVal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ₹{spVal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      {discountPct > 0 ? (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {discountPct}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No Discount</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          p.stock > 10
                            ? 'bg-teal-50 text-teal-800'
                            : p.stock > 0
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleVisibility(p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                          p.isActive
                            ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={p.isActive ? 'Click to hide from store' : 'Click to show on store'}
                      >
                        {p.isActive ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Live on Store
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-6 sm:my-10 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-700" />
                Add New Product to Website
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Attractive Error Banner */}
              {formError && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm text-rose-900 animate-in fade-in">
                  <div className="p-2 bg-rose-500 text-white rounded-xl flex-shrink-0 shadow-md">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-rose-950 text-xs tracking-wide uppercase flex items-center gap-1.5">
                      <span>⚠️ Form Fill Validation Error</span>
                    </h4>
                    <p className="text-xs font-semibold text-rose-700 mt-1 whitespace-pre-line leading-relaxed">
                      {formError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Attractive Success Toast */}
              {formSuccess && (
                <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm text-emerald-900 animate-in fade-in">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-xl flex-shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-emerald-900 flex-1">{formSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setFormSuccess(null)}
                    className="p-1 text-emerald-500 hover:text-emerald-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Glycomet-GP 2 Forte Tablet"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition ${
                    fieldErrors.name
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                      : 'border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      setFormCategoryId(e.target.value);
                      if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition ${
                      fieldErrors.category
                        ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                        : 'border-slate-200 focus:border-teal-700'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Write details about the product, its usage, dosage, or advantages..."
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition ${
                    fieldErrors.description
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                      : 'border-slate-200 focus:border-teal-700'
                  }`}
                />
                {fieldErrors.description && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Pricing & Discount */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-teal-700" />
                  Price &amp; Discount Configuration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Original MRP (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="e.g. 500"
                      value={formMrp}
                      onChange={(e) => handleMrpChange(e.target.value)}
                      className={`w-full bg-white border rounded-xl p-2 text-xs outline-none transition ${
                        fieldErrors.mrp
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                          : 'border-slate-200 focus:border-teal-700'
                      }`}
                    />
                    {fieldErrors.mrp && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> {fieldErrors.mrp}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Discount (% OFF) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 20"
                      value={formDiscountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-teal-700 text-emerald-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="e.g. 400"
                      value={formSellingPrice}
                      onChange={(e) => handleSellingPriceChange(e.target.value)}
                      className={`w-full bg-white border rounded-xl p-2 text-xs outline-none transition font-bold ${
                        fieldErrors.sellingPrice
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                          : 'border-slate-200 focus:border-teal-700 text-slate-900'
                      }`}
                    />
                    {fieldErrors.sellingPrice && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> {fieldErrors.sellingPrice}
                      </p>
                    )}
                  </div>
                </div>
                {Number(formMrp) > Number(formSellingPrice) && (
                  <div className="text-[11px] text-emerald-700 font-bold mt-2">
                    ✓ Customer saves ₹{(Number(formMrp) - Number(formSellingPrice)).toFixed(2)} ({formDiscountPercent}% Discount)!
                  </div>
                )}
              </div>

              {/* 5 Product Images with Gallery Upload */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Package className="w-4 h-4 text-teal-700" />
                    Product Images (Add Up to 5 Images from Gallery or URL)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Image 1 is the main cover photo</span>
                </div>

                <div className="space-y-3">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:border-teal-400/60 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                            {idx === 0 ? 'Image 1 (Main Cover Image)' : `Image ${idx + 1} (Gallery Image)`}
                          </span>
                          {idx === 0 && (
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Thumbnail preview */}
                        <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={`Thumb ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as any).src = 'https://placehold.co/100x100?text=Error'; }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4 mb-0.5" />
                              <span className="text-[9px] font-bold">Slot {idx + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button + URL input */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-[11px] transition shadow-xs">
                              {uploadingIdx === idx ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>📁 Gallery / Device Se Choose Karein</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingIdx === idx}
                                onChange={(e) => handleFileUpload(idx, e)}
                              />
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">ya online URL:</span>
                          </div>

                          <input
                            type="text"
                            placeholder={idx === 0 ? 'https://images.unsplash.com/... ya Gallery se photo upload karein' : `https://images.unsplash.com/... (Image ${idx + 1} URL - Optional)`}
                            value={imgUrl}
                            onChange={(e) => handleImageChange(idx, e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show on website */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-teal-700 rounded border-slate-300"
                />
                <label htmlFor="addIsActive" className="font-bold text-slate-800 cursor-pointer">
                  Show this product on the website immediately
                </label>
              </div>

              {/* Add to Top Products + Category Selection */}
              <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="addIsTopProduct"
                    checked={formIsTopProduct}
                    onChange={(e) => {
                      setFormIsTopProduct(e.target.checked);
                      if (e.target.checked && !formTopCategory) {
                        setFormTopCategory(formCategoryId);
                      }
                    }}
                    className="w-4 h-4 text-amber-600 rounded border-amber-300 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-amber-950 flex items-center gap-1">
                      ★ Mark as Top Product (Navbar Showcase)
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Shows this product in the Navbar Top Products row. Maximum 4 Top Products per category (8 total across both categories).
                    </p>
                  </div>
                </label>

                {formIsTopProduct && (
                  <div className="pl-6 pt-2 border-t border-amber-200/80 space-y-1">
                    <label className="block font-bold text-amber-950 text-xs">
                      Which Category should this Top Product appear under on Navbar? <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTopCategory}
                      onChange={(e) => {
                        setFormTopCategory(e.target.value);
                        if (fieldErrors.topCategory) setFieldErrors((prev) => ({ ...prev, topCategory: '' }));
                      }}
                      className={`w-full bg-white border rounded-xl p-2.5 text-xs text-slate-800 font-bold outline-none ${
                        fieldErrors.topCategory
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950'
                          : 'border-amber-300 focus:ring-2 focus:ring-amber-400'
                      }`}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.slug === 'cirrhosis-liver-care' ? '(Cirrhosis Top 4)' : c.slug === 'intimate-care' ? '(Intimate Top 4)' : ''}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.topCategory && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> {fieldErrors.topCategory}
                      </p>
                    )}
                    <p className="text-[10px] text-amber-700 font-semibold mt-1">
                      ✓ Clicking this product under this category in the Navbar will open this exact product directly.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save &amp; Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && currentEditingProduct && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-6 sm:my-10 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-700" />
                Edit Product
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              {/* Attractive Error Banner */}
              {formError && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm text-rose-900 animate-in fade-in">
                  <div className="p-2 bg-rose-500 text-white rounded-xl flex-shrink-0 shadow-md">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-rose-950 text-xs tracking-wide uppercase flex items-center gap-1.5">
                      <span>⚠️ Form Fill Validation Error</span>
                    </h4>
                    <p className="text-xs font-semibold text-rose-700 mt-1 whitespace-pre-line leading-relaxed">
                      {formError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Attractive Success Toast */}
              {formSuccess && (
                <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm text-emerald-900 animate-in fade-in">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-xl flex-shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-emerald-900 flex-1">{formSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setFormSuccess(null)}
                    className="p-1 text-emerald-500 hover:text-emerald-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition ${
                    fieldErrors.name
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                      : 'border-slate-200 focus:border-teal-700'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      setFormCategoryId(e.target.value);
                      if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition ${
                      fieldErrors.category
                        ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                        : 'border-slate-200 focus:border-teal-700'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition ${
                    fieldErrors.description
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                      : 'border-slate-200 focus:border-teal-700'
                  }`}
                />
                {fieldErrors.description && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Pricing & Discount */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-teal-700" />
                  Price &amp; Discount Configuration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Original MRP (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formMrp}
                      onChange={(e) => handleMrpChange(e.target.value)}
                      className={`w-full bg-white border rounded-xl p-2 text-xs outline-none transition ${
                        fieldErrors.mrp
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                          : 'border-slate-200 focus:border-teal-700'
                      }`}
                    />
                    {fieldErrors.mrp && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> {fieldErrors.mrp}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Discount (% OFF) <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formDiscountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-teal-700 text-emerald-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formSellingPrice}
                      onChange={(e) => handleSellingPriceChange(e.target.value)}
                      className={`w-full bg-white border rounded-xl p-2 text-xs outline-none transition font-bold ${
                        fieldErrors.sellingPrice
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950 font-semibold'
                          : 'border-slate-200 focus:border-teal-700 text-slate-900'
                      }`}
                    />
                    {fieldErrors.sellingPrice && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> {fieldErrors.sellingPrice}
                      </p>
                    )}
                  </div>
                </div>
                {Number(formMrp) > Number(formSellingPrice) && (
                  <div className="text-[11px] text-emerald-700 font-bold mt-2">
                    ✓ Customer saves ₹{(Number(formMrp) - Number(formSellingPrice)).toFixed(2)} ({formDiscountPercent}% Discount)!
                  </div>
                )}
              </div>

              {/* 5 Product Images with Gallery Upload */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Package className="w-4 h-4 text-teal-700" />
                    Product Images (Add Up to 5 Images from Gallery or URL)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Image 1 is the main cover photo</span>
                </div>

                <div className="space-y-3">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:border-teal-400/60 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                            {idx === 0 ? 'Image 1 (Main Cover Image)' : `Image ${idx + 1} (Gallery Image)`}
                          </span>
                          {idx === 0 && (
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Thumbnail preview */}
                        <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={`Thumb ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as any).src = 'https://placehold.co/100x100?text=Error'; }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4 mb-0.5" />
                              <span className="text-[9px] font-bold">Slot {idx + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button + URL input */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-[11px] transition shadow-xs">
                              {uploadingIdx === idx ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>📁 Gallery / Device Se Choose Karein</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingIdx === idx}
                                onChange={(e) => handleFileUpload(idx, e)}
                              />
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">ya online URL:</span>
                          </div>

                          <input
                            type="text"
                            placeholder={idx === 0 ? 'https://images.unsplash.com/... ya Gallery se photo upload karein' : `https://images.unsplash.com/... (Image ${idx + 1} URL - Optional)`}
                            value={imgUrl}
                            onChange={(e) => handleImageChange(idx, e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show on website */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-teal-700 rounded border-slate-300"
                />
                <label htmlFor="editIsActive" className="font-bold text-slate-800 cursor-pointer">
                  Show this product on the website
                </label>
              </div>

              {/* Add to Top Products + Category Selection */}
              <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="editIsTopProduct"
                    checked={formIsTopProduct}
                    onChange={(e) => {
                      setFormIsTopProduct(e.target.checked);
                      if (e.target.checked && !formTopCategory) {
                        setFormTopCategory(formCategoryId);
                      }
                    }}
                    className="w-4 h-4 text-amber-600 rounded border-amber-300 mt-0.5"
                  />
                  <div>
                    <span className="font-extrabold text-amber-950 flex items-center gap-1">
                      ★ Mark as Top Product (Navbar Showcase)
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Shows this product in the Navbar Top Products row. Maximum 4 Top Products per category (8 total across both categories).
                    </p>
                  </div>
                </label>

                {formIsTopProduct && (
                  <div className="pl-6 pt-2 border-t border-amber-200/80 space-y-1">
                    <label className="block font-bold text-amber-950 text-xs">
                      Which Category should this Top Product appear under on Navbar? <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTopCategory}
                      onChange={(e) => {
                        setFormTopCategory(e.target.value);
                        if (fieldErrors.topCategory) setFieldErrors((prev) => ({ ...prev, topCategory: '' }));
                      }}
                      className={`w-full bg-white border rounded-xl p-2.5 text-xs text-slate-800 font-bold outline-none ${
                        fieldErrors.topCategory
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200 text-rose-950'
                          : 'border-amber-300 focus:ring-2 focus:ring-amber-400'
                      }`}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.slug === 'cirrhosis-liver-care' ? '(Cirrhosis Top 4)' : c.slug === 'intimate-care' ? '(Intimate Top 4)' : ''}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.topCategory && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" /> {fieldErrors.topCategory}
                      </p>
                    )}
                    <p className="text-[10px] text-amber-700 font-semibold mt-1">
                      ✓ Clicking this product under this category in the Navbar will open this exact product directly.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 2. ORDERS MANAGEMENT PANEL
// =========================================================================
function AdminOrdersPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Status update modal state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [courierPartner, setCourierPartner] = useState('BlueDart Express');
  const [awbNumber, setAwbNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/orders?status=${selectedStatus}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setCourierPartner(order.shipment?.courierPartnerName || 'BlueDart Express');
    setAwbNumber(order.shipment?.awbNumber || `AWB-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          newStatus,
          courierPartner: newStatus === 'SHIPPED' ? courierPartner : undefined,
          awbNumber: newStatus === 'SHIPPED' ? awbNumber : undefined,
        }),
      });

      if (res.ok) {
        alert('Order status updated successfully');
        setSelectedOrder(null);
        await fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update order');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
      case 'PAYMENT_CONFIRMED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'PENDING_PAYMENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-teal-700" />
            Order Management Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View customer orders, check shipping details, update status, and manage shipments.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PROCESSING', label: 'Processing' },
            { id: 'SHIPPED', label: 'Shipped' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition ${
                selectedStatus === tab.id
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order ID (ORD-...), Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-700"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No orders found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items Ordered</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const totalAmt = (order.finalPayableAmount / 100).toFixed(2);
                  const isCod = order.payment?.paymentMethod === 'COD';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {order.user?.fullName || order.address?.recipientName || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {order.user?.phone || order.address?.phone || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {order.address
                            ? `${order.address.city}, ${order.address.state} - ${order.address.pincode}`
                            : 'Address not available'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-xs">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="text-[11px] text-slate-700">
                              <span className="font-semibold">{item.quantity}x</span>{' '}
                              {item.productNameSnapshot}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ₹{totalAmt}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {isCod ? (
                            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              Cash on Delivery
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              Paid Online
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                        {order.shipment?.awbNumber && (
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            AWB: {order.shipment.awbNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs px-3 py-1.5 rounded-lg border border-teal-200 transition"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-start sm:items-center">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Update Order Status
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              {selectedOrder.orderNumber}
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-800 focus:border-teal-700"
                >
                  <option value="PROCESSING">Processing / Confirmed</option>
                  <option value="SHIPPED">Shipped / In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {newStatus === 'SHIPPED' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Tracking / AWB Number</label>
                    <input
                      type="text"
                      value={awbNumber}
                      onChange={(e) => setAwbNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 3. OVERVIEW DASHBOARD PANEL
// =========================================================================
function AdminDashboardPanel({ onNavigateTab }: { onNavigateTab: (tab: 'products' | 'orders' | 'dashboard') => void }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
      </div>
    );
  }

  const { metrics, lowStockProducts, recentOrders } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-teal-700" />
          Website Admin &amp; Operations Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor real-time customer orders, catalog inventory, revenue, and fulfillment.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Gross Sales &amp; Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{metrics?.totalRevenueRupees?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">Processed Online &amp; COD</div>
        </div>

        <div
          onClick={() => onNavigateTab('products')}
          className="bg-teal-50 border border-teal-200 hover:border-teal-300 rounded-2xl p-5 shadow-sm space-y-2 transition block cursor-pointer group"
        >
          <div className="flex items-center justify-between text-teal-900 text-xs font-semibold">
            <span>Product Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-teal-200 text-teal-900 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-950">
            Products &amp; Discounts
          </div>
          <div className="text-[11px] text-teal-800 group-hover:underline font-bold">
            Add products, edit discounts &amp; prices →
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm space-y-2 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics?.totalOrders}</div>
          <div className="text-[11px] text-blue-700 font-semibold group-hover:underline">
            Manage &amp; ship customer orders →
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Low Stock Inventory Alerts ({lowStockProducts.length} items)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p: any) => (
              <div
                key={p.id}
                className="bg-white/80 border border-amber-200 rounded-xl p-3 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-900 truncate max-w-[180px]">{p.name}</div>
                  <div className="text-[11px] text-slate-500">Remaining: <span className="font-bold text-rose-600">{p.stock} units</span></div>
                </div>
                <button
                  onClick={() => onNavigateTab('products')}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg text-[11px]"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 4. USERS & CUSTOMERS MANAGEMENT PANEL
// =========================================================================
function AdminUsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
      }
    } catch (e) {
      console.error('Error updating user status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalAdmins = users.filter((u) => u.role === 'SUPER_ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-600" />
            Registered Users &amp; Customers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View everyone who has created an account or logged into the website. Control status &amp; view order history.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Registered in database</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Customers</div>
          <div className="text-2xl font-black text-teal-700 mt-1">{totalCustomers}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Website buyers / patients</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Admins</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{totalAdmins}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Store controllers</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone number..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('CUSTOMER')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
              roleFilter === 'CUSTOMER'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Customers ({totalCustomers})
          </button>
          <button
            onClick={() => setRoleFilter('SUPER_ADMIN')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
              roleFilter === 'SUPER_ADMIN'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Admins ({totalAdmins})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs font-bold">Loading registered users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-center">Status / Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'SUPER_ADMIN' ? (
                        <span className="bg-purple-100 text-purple-900 font-extrabold px-2.5 py-1 rounded-lg text-[10px] tracking-wide">
                          ADMIN
                        </span>
                      ) : (
                        <span className="bg-teal-100 text-teal-900 font-extrabold px-2.5 py-1 rounded-lg text-[10px] tracking-wide">
                          CUSTOMER
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {u.orderCount} {u.orderCount === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleUserStatus(u.id, u.isActive)}
                        disabled={updatingId === u.id || u.role === 'SUPER_ADMIN'}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        } ${u.role === 'SUPER_ADMIN' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {updatingId === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : u.isActive ? (
                          'Active (Block)'
                        ) : (
                          'Blocked (Unblock)'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      }
    >
      <AdminConsole />
    </Suspense>
  );
}
