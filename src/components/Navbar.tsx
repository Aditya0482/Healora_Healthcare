'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingCart, User, ChevronDown, LogOut, Package, AlertTriangle, Settings, Shield } from 'lucide-react';
import { getAvatarUrl } from '@/lib/avatars';

const CATEGORIES = [
  {
    name: 'Cirrhosis',
    slug: 'cirrhosis-liver-care',
    dot: 'bg-amber-500',
    badge: 'Top 4 Products',
    subs: [
      { label: 'Top 1', name: 'Liver Care', slug: 'hepatic-encephalopathy' },
      { label: 'Top 2', name: 'Health Care', slug: 'ascites-diuretics' },
      { label: 'Top 3', name: 'Daily Care', slug: 'portal-hypertension' },
      { label: 'Top 4', name: 'Wellness Care', slug: 'hepatoprotective-bile-acids' },
    ],
  },
  {
    name: 'Intimate',
    slug: 'intimate-care',
    dot: 'bg-rose-400',
    badge: 'Top 4 Products',
    subs: [
      { label: 'Top 1', name: 'Personal Hygiene', slug: 'personal-hygiene' },
      { label: 'Top 2', name: 'Intimate Wellness', slug: 'sexual-wellness' },
      { label: 'Top 3', name: 'Personal Wellness', slug: 'feminine-care' },
      { label: 'Top 4', name: "Intimate Essential", slug: 'mens-wellness' },
    ],
  },
];

export default function Navbar({ onOpenUploadModal }: { onOpenUploadModal?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [topProducts, setTopProducts] = useState<{ cirrhosis: any[]; intimate: any[] }>({
    cirrhosis: [],
    intimate: [],
  });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        const res = await fetch('/api/products/top');
        if (res.ok) {
          const data = await res.json();
          setTopProducts(data);
        }
      } catch (e) {
        console.error('Error fetching top products:', e);
      }
    }
    fetchTopProducts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) { const data = await res.json(); setSuggestions(data.products.slice(0, 5)); setShowSuggestions(true); }
      } catch (e) { console.error(e); }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm w-full">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className="bg-teal-600 text-white font-semibold px-2 py-0.5 rounded text-[10px]">Authentic</span>
            <span className="text-teal-400 font-semibold text-[11px] sm:text-xs">100% GENUINE PRODUCTS</span>
            <span className="hidden md:inline text-slate-400">• Shop with confidence</span>
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px]">
            <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3.5 h-3.5" />Exclusive Deals</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <Link href="/support/delivery" className="hover:text-white transition">Fast Delivery</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group min-w-0">
            <img
              src="/logo.png"
              alt="Healora HealthCare"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 leading-none">Healora <span className="text-teal-700">HealthCare</span></div>
              <div className="text-[9px] sm:text-[10px] tracking-wider text-slate-500 font-semibold uppercase mt-0.5 truncate">YOUR TRUSTED HEALTH STORE</div>
            </div>
          </Link>

          {/* Search (Tablet / Desktop) */}
          <div className="flex-1 max-w-xl relative hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search products (e.g. Madhusaar,Kaamya)..."
                className="w-full bg-slate-100 border border-slate-300 focus:border-teal-500 focus:bg-white text-slate-900 text-sm rounded-full pl-11 pr-24 py-2.5 outline-none transition" />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <button type="submit" className="absolute right-1.5 top-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition">Search</button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="divide-y divide-slate-100">
                  {suggestions.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`} onClick={() => setShowSuggestions(false)} className="p-3 hover:bg-teal-50 flex items-center justify-between transition group">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-teal-700">{p.name}</div>
                        <div className="text-xs text-slate-500"><span className="font-medium">{p.genericSaltName}</span> • {p.strength}</div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Rs.{(p.sellingPrice / 100).toFixed(2)}</div>
                    </Link>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                  <button onClick={handleSearchSubmit} className="text-xs text-teal-700 hover:underline font-semibold">View all results</button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/cart"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  router.push('/auth/login?redirect=/cart');
                }
              }}
              className="relative p-2 text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition flex items-center"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{totalItemsCount}</span>}
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-full transition border border-slate-200"
                >
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.fullName}
                    className="w-6 h-6 rounded-full bg-teal-100 object-cover border border-teal-500/30"
                  />
                  <span className="hidden md:inline max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
                {userMenuOpen && (
                  <div
                    onMouseLeave={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <Link
                      href="/account/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 hover:bg-teal-50/60 transition group cursor-pointer"
                      title="View Full Profile"
                    >
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-800">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          {user.email}
                        </div>
                      </div>
                    </Link>

                    <div className="py-1">
                      <Link
                        href="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition"
                      >
                        <User className="w-4 h-4 text-teal-600" />
                        My Profile
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders
                      </Link>

                      <Link
                        href="/account/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-semibold transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings
                      </Link>

                      {['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(user.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-indigo-700 hover:bg-indigo-50 font-semibold transition"
                        >
                          <Shield className="w-4 h-4 text-indigo-600" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold text-left transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg transition shadow-sm whitespace-nowrap">Sign In</Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (Phone screens) */}
        <div className="mt-2.5 block sm:hidden relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search products (e.g. Rifaximin, Lactulose)..."
              className="w-full bg-slate-100 border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-900 text-xs rounded-full pl-9 pr-20 py-2 outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-semibold px-3 py-1 rounded-full transition"
            >
              Search
            </button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="divide-y divide-slate-100">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="p-2.5 hover:bg-teal-50 flex items-center justify-between transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-700 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.strength}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 flex-shrink-0">Rs.{(p.sellingPrice / 100).toFixed(2)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Inline Category Nav Bar — always visible, horizontal touch scroll ── */}
        <nav className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100 w-full max-w-full overflow-x-auto no-scrollbar touch-pan-x">
          <div className="flex items-center gap-0 min-w-max">
            {CATEGORIES.map((cat, catIdx) => (
              <React.Fragment key={cat.slug}>
                {/* Category name — dark pill */}
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl mr-2 whitespace-nowrap transition shadow-sm"
                >
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`}></span>
                  <span>{cat.name}</span>
                  <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">Top 4</span>
                </Link>

                {/* Top Products links inline — direct link to /product/[slug] */}
                {(() => {
                  const dynamicProducts =
                    cat.slug === 'cirrhosis-liver-care'
                      ? topProducts.cirrhosis
                      : topProducts.intimate;

                  const itemsToRender =
                    dynamicProducts && dynamicProducts.length > 0
                      ? dynamicProducts.slice(0, 4)
                      : cat.subs;

                  return itemsToRender.map((item: any, i: number) => {
                    const isProduct = Boolean(item.slug && dynamicProducts && dynamicProducts.length > 0);
                    const href = isProduct
                      ? `/product/${item.slug}`
                      : `/category/${cat.slug}?sub=${item.slug}`;

                    return (
                      <Link
                        key={item.id || item.slug}
                        href={href}
                        className="flex flex-col items-center px-3.5 py-1.5 text-center hover:bg-teal-50 border border-transparent hover:border-teal-200 rounded-xl transition group mr-1.5 whitespace-nowrap"
                      >
                        <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-teal-700 flex items-center gap-1">
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded">
                            ★ Top {i + 1}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500 group-hover:text-teal-800 font-medium leading-tight mt-0.5 max-w-[130px] truncate">
                          {item.name}
                        </span>
                      </Link>
                    );
                  });
                })()}

                {/* Divider between categories */}
                {catIdx < CATEGORIES.length - 1 && (
                  <div className="w-px h-8 bg-slate-200 mx-3 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}