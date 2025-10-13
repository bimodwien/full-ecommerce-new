'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import {
  Search,
  ChevronDown,
  MapPin,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  LayoutGrid,
  Flame,
  Headphones,
  Menu,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDebounce } from 'use-debounce';
import { fetchCategory } from '@/helpers/fetch-category';
import { TCategory } from '@/models/category.model';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');

  const auth = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Categories for dropdowns
  const [categories, setCategories] = useState<TCategory[]>([]);
  useEffect(() => {
    fetchCategory(setCategories).catch(() => {});
  }, []);

  // Selected category from URL
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const selectedCategoryLabel = useMemo(
    () =>
      categories.find((c) => c.id === selectedCategoryId)?.name ||
      'All Categories',
    [categories, selectedCategoryId],
  );

  // Search (desktop input) synced with URL (debounced)
  const initialName = searchParams.get('name') || '';
  const [query, setQuery] = useState(initialName);
  const [debouncedQuery] = useDebounce(query, 500);
  useEffect(() => {
    // Keep local state in sync when URL changes externally
    setQuery(initialName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName]);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery && debouncedQuery.trim() !== '')
      params.set('name', debouncedQuery.trim());
    else params.delete('name');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const isLoggedIn = Boolean(auth?.id && auth.id !== '');
  const shortName = (auth?.username ?? 'User').slice(0, 4);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <header className="w-full border-b border-zinc-200 text-xs text-zinc-500">
      <div className="mx-auto max-w-screen-2xl px-4">
        {/* Top utility bar */}
        <div className="hidden h-9 items-center justify-between gap-4 lg:flex">
          <nav className="flex items-center gap-3">
            <Link href="#" className="hover:text-zinc-700">
              About Us
            </Link>
            <span className="h-3 w-px bg-zinc-200" />
            <Link href="#" className="hover:text-zinc-700">
              My Account
            </Link>
            <span className="h-3 w-px bg-zinc-200" />
            <Link href="#" className="hover:text-zinc-700">
              Wishlist
            </Link>
            <span className="h-3 w-px bg-zinc-200" />
            <Link href="#" className="hover:text-zinc-700">
              Order Tracking
            </Link>
          </nav>

          <p className="hidden text-center text-sm font-semibold md:block">
            100% Secure delivery without contacting the courier
          </p>

          <div className="flex items-center gap-3">
            <p>
              <span>Need help? Call Us: </span>
              <span className="font-semibold text-emerald-500">+1800 900</span>
            </p>
            <span className="hidden h-3 w-px bg-zinc-200 sm:block" />
            <button
              className="hidden items-center gap-1 sm:flex hover:text-zinc-700"
              aria-label="Change language"
            >
              <span>English</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>
            <span className="hidden h-3 w-px bg-zinc-200 sm:block" />
            <button
              className="hidden items-center gap-1 sm:flex hover:text-zinc-700"
              aria-label="Change currency"
            >
              <span>IDR</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Main header row: logo + search + actions */}
        <div className="grid grid-cols-3 items-center gap-3 py-4 lg:flex lg:items-center lg:justify-between lg:gap-6">
          {/* Mobile: left burger */}
          <div className="lg:hidden justify-self-start">
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          {/* Logo + Brand */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-1 sm:gap-2 justify-self-center"
          >
            <Image
              src="/logo.png"
              alt="TokoPakBimo Logo"
              className="h-9 w-auto sm:h-10"
              width={40}
              height={40}
            />
            <span
              className="inline-block text-base sm:text-xl font-semibold text-gray-900 whitespace-nowrap truncate max-w-[140px] sm:max-w-none"
              style={{ fontFamily: 'var(--font-bebas-neue)' }}
            >
              TokoPakBimo
            </span>
            <span className="sr-only">Home</span>
          </Link>

          {/* Search with category (desktop only) */}
          <div className="hidden w-full max-w-3xl flex-1 items-center lg:flex">
            <div className="flex w-full items-stretch rounded-md border border-emerald-200 bg-white shadow-sm">
              {/* Category dropdown (desktop search) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 whitespace-nowrap rounded-l-md px-3 py-2 text-sm text-zinc-700 hover:bg-emerald-50"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                  >
                    <span className="font-medium truncate max-w-[180px]">
                      {selectedCategoryLabel}
                    </span>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-80 w-64 overflow-auto"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.delete('categoryId');
                      const qs = params.toString();
                      router.replace(qs ? `${pathname}?${qs}` : pathname, {
                        scroll: false,
                      });
                    }}
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.set('categoryId', c.id);
                        const qs = params.toString();
                        router.replace(qs ? `${pathname}?${qs}` : pathname, {
                          scroll: false,
                        });
                      }}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="my-2 h-6 w-px bg-emerald-200" />
              <input
                type="text"
                placeholder="Search for items..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="px-3 text-emerald-600 hover:text-emerald-700"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right actions (desktop only) */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Location pill */}
            <button
              className="ml-8 flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 md:ml-12"
              aria-label="Choose location"
            >
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Your Location</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>

            {/* Icons */}
            <ul className="flex items-center gap-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="group relative flex items-center gap-1 text-zinc-700 hover:text-emerald-600"
                >
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                    6
                  </span>
                  <Heart className="h-6 w-6" />
                  <span>Wishlist</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="group relative flex items-center gap-1 text-zinc-700 hover:text-emerald-600"
                >
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                    2
                  </span>
                  <ShoppingCart className="h-6 w-6" />
                  <span>Cart</span>
                </Link>
              </li>
              <li>
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-zinc-700 hover:text-emerald-600"
                  >
                    <User className="h-6 w-6" />
                    <span>Account</span>
                  </Link>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 cursor-pointer text-zinc-700 hover:text-emerald-600">
                        <User className="h-6 w-6" />
                        <span className="max-w-[180px] truncate">
                          hi,{' '}
                          <span className="text-emerald-600 font-semibold first-letter:capitalize ">
                            {shortName}
                          </span>
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-red-500">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            </ul>
          </div>

          {/* Mobile right icons */}
          <div className="lg:hidden justify-self-end flex items-center gap-4">
            <Link
              href="#"
              className="relative inline-flex items-center text-zinc-700 hover:text-emerald-600"
              aria-label="Wishlist"
            >
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                6
              </span>
              <Heart className="h-6 w-6" />
            </Link>
            <Link
              href="#"
              className="relative inline-flex items-center text-zinc-700 hover:text-emerald-600"
              aria-label="Cart"
            >
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                2
              </span>
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Bottom navigation row */}
        <div className="hidden items-center justify-between gap-6 border-t border-zinc-100 py-3 lg:flex">
          {/* Browse categories (dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-[#3BB77E] px-4 py-2.5 text-white shadow hover:bg-emerald-600"
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="font-semibold">Browse All Categories</span>
                <ChevronDown size={16} className="opacity-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-96 w-72 overflow-auto"
            >
              <DropdownMenuItem
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('categoryId');
                  const qs = params.toString();
                  router.replace(qs ? `${pathname}?${qs}` : pathname, {
                    scroll: false,
                  });
                }}
              >
                All Categories
              </DropdownMenuItem>
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('categoryId', c.id);
                    const qs = params.toString();
                    router.replace(qs ? `${pathname}?${qs}` : pathname, {
                      scroll: false,
                    });
                  }}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Main nav */}
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-zinc-700 md:flex">
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              <Flame className="h-4 w-4 text-emerald-500" />
              <span>Deals</span>
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 font-semibold text-emerald-600"
            >
              Home
              <ChevronDown size={14} className="text-emerald-600" />
            </Link>
            <Link href="#" className="hover:text-emerald-600">
              About
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              Shop
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              Vendors
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              Mega menu
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              Blog
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              Pages
              <ChevronDown size={14} />
            </Link>
            <Link href="#" className="hover:text-emerald-600">
              Contact
            </Link>
          </nav>

          {/* Support */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Headphones className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-emerald-600">
                1900 - 888
              </div>
              <div className="text-[11px] text-zinc-400">
                24/7 Support Center
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu overlay: only search + account */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 rounded-b-xl bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <SearchBar
                placeholder="Search products..."
                value={mobileQuery}
                onChange={setMobileQuery}
              />
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-red-500">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
