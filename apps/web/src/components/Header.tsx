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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const auth = useAppSelector((s) => s.auth);
  const wishlistCount = useAppSelector((s) => s.wishlist.count);
  const cartCount = useAppSelector((s) => s.cart.count);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Categories for dropdowns
  const [categories, setCategories] = useState<TCategory[]>([]);
  useEffect(() => {
    fetchCategory(setCategories).catch(() => {});
  }, []);

  // isLoggedIn derived from Redux auth; gated on `mounted` so the first
  // client render always matches the server (hydration-safe), even if
  // AuthProvider's auth check resolves before this component hydrates.
  const isLoggedIn = mounted && Boolean(auth?.id && auth.id !== '');

  // Same reason for the badge counts: Redux only has them after the client
  // hydrates, so the server always renders 0 (no badge).
  const shownWishlistCount = mounted ? wishlistCount : 0;
  const shownCartCount = mounted ? cartCount : 0;

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

  const shortName = (auth?.username ?? 'User').slice(0, 4);
  const isHome = pathname === '/';

  const handleNotAvailable = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info('In development stage');
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <header className="w-full border-b border-hairline text-xs text-mute">
      <div className="mx-auto max-w-screen-2xl px-4">
        {/* Top utility bar */}
        <div className="hidden h-9 items-center justify-between gap-4 lg:flex">
          <nav className="flex items-center gap-3">
            <Link
              href="#"
              className="hover:text-ink"
              onClick={handleNotAvailable}
            >
              About Us
            </Link>
            <span className="h-3 w-px bg-hairline" />
            <Link
              href="#"
              className="hover:text-ink"
              onClick={handleNotAvailable}
            >
              My Account
            </Link>
            <span className="h-3 w-px bg-hairline" />
            <Link href="/wishlist" className="hover:text-ink">
              Wishlist
            </Link>
            <span className="h-3 w-px bg-hairline" />
            <Link href="/order" className="hover:text-ink">
              Order Tracking
            </Link>
          </nav>

          <p className="hidden text-center text-sm font-semibold text-ink md:block">
            100% Secure delivery without contacting the courier
          </p>

          <div className="flex items-center gap-3">
            <p>
              <span>Need help? Call Us: </span>
              <span className="font-semibold text-ink">+1800 XXX</span>
            </p>
            <span className="hidden h-3 w-px bg-hairline sm:block" />
            <button
              className="hidden items-center gap-1 sm:flex hover:text-ink"
              aria-label="Change language"
              onClick={handleNotAvailable}
            >
              <span>English</span>
              <ChevronDown size={14} className="text-mute" />
            </button>
            <span className="hidden h-3 w-px bg-hairline sm:block" />
            <button
              className="hidden items-center gap-1 sm:flex hover:text-ink"
              aria-label="Change currency"
              onClick={handleNotAvailable}
            >
              <span>IDR</span>
              <ChevronDown size={14} className="text-mute" />
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-canvas text-ink"
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
              className="inline-block text-base sm:text-4xl font-semibold text-ink whitespace-nowrap truncate max-w-35 sm:max-w-none"
              style={{ fontFamily: 'var(--font-bebas-neue)' }}
            >
              TokoPakBimo
            </span>
            <span className="sr-only">Home</span>
          </Link>

          {/* Search with category (desktop only) */}
          <div className="hidden w-full max-w-3xl flex-1 items-center lg:flex">
            <div className="flex w-full items-stretch rounded-3xl bg-soft-cloud has-[input:focus]:bg-canvas has-[input:focus]:border-2 has-[input:focus]:border-ink has-[input:focus]:ring-4 has-[input:focus]:ring-soft-cloud transition-colors">
              {/* Category dropdown (desktop search) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 whitespace-nowrap rounded-l-full px-4 py-2 text-sm text-ink hover:bg-hairline-soft"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                  >
                    <span className="font-medium truncate max-w-45">
                      {selectedCategoryLabel}
                    </span>
                    <ChevronDown size={16} className="text-mute" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-80 w-64 overflow-auto rounded-none border-hairline"
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
              <span className="my-2 h-6 w-px bg-hairline" />
              <input
                type="text"
                placeholder="Search for items..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder-mute outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="px-4 text-ink hover:text-mute"
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
              className="ml-8 flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm text-ink hover:bg-soft-cloud md:ml-12"
              aria-label="Choose location"
              onClick={handleNotAvailable}
            >
              <MapPin className="h-4 w-4 text-ink" />
              <span>Your Location</span>
              <ChevronDown size={14} className="text-mute" />
            </button>

            {/* Icons */}
            <ul className="flex items-center gap-4 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      toast.warning(
                        'You must be logged in to access Wishlist.',
                      );
                      return;
                    }
                    router.push('/wishlist');
                  }}
                  className="group relative flex items-center gap-1 text-ink hover:text-mute"
                >
                  {shownWishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-canvas">
                      {shownWishlistCount}
                    </span>
                  )}
                  <Heart className="h-6 w-6" />
                  <span>Wishlist</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      toast.warning('You must be logged in to access Cart.');
                      return;
                    }
                    router.push('/cart');
                  }}
                  className="group relative flex items-center gap-1 text-ink hover:text-mute"
                >
                  {shownCartCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-canvas">
                      {shownCartCount}
                    </span>
                  )}
                  <ShoppingCart className="h-6 w-6" />
                  <span>Cart</span>
                </button>
              </li>
              <li>
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-ink hover:text-mute"
                  >
                    <User className="h-6 w-6" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 cursor-pointer text-ink hover:text-mute">
                        <User className="h-6 w-6" />
                        <span className="max-w-45 truncate">
                          hi,{' '}
                          <span className="font-semibold first-letter:capitalize">
                            {shortName}
                          </span>
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-none border-hairline"
                    >
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-ink">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            </ul>
          </div>

          {/* Mobile right icons */}
          <div className="lg:hidden justify-self-end flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  toast.warning('You must be logged in to access Wishlist.');
                  return;
                }
                router.push('/wishlist');
              }}
              className="relative inline-flex items-center text-ink hover:text-mute"
              aria-label="Wishlist"
            >
              {shownWishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-canvas">
                  {shownWishlistCount}
                </span>
              )}
              <Heart className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  toast.warning('You must be logged in to access Cart.');
                  return;
                }
                router.push('/cart');
              }}
              className="relative inline-flex items-center text-ink hover:text-mute"
              aria-label="Cart"
            >
              {shownCartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-canvas">
                  {shownCartCount}
                </span>
              )}
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Bottom navigation row */}
        <div className="hidden items-center justify-between gap-6 border-t border-hairline-soft py-3 lg:flex">
          {/* Browse categories (dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-canvas hover:bg-ink/90"
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="font-semibold">Browse All Categories</span>
                <ChevronDown size={16} className="opacity-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-96 w-72 overflow-auto rounded-none border-hairline"
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
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-ink md:flex">
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-mute"
              onClick={handleNotAvailable}
            >
              <Flame className="h-4 w-4" />
              <span>Deals</span>
            </Link>
            <Link
              href="/"
              className={`inline-flex items-center gap-1 pb-1 ${isHome ? 'border-b-2 border-ink font-medium' : 'hover:text-mute'}`}
            >
              Home
            </Link>
            <Link
              href="#"
              className="hover:text-mute"
              onClick={handleNotAvailable}
            >
              About
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-mute"
              onClick={handleNotAvailable}
            >
              Shop
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-mute"
              onClick={handleNotAvailable}
            >
              Vendors
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-mute"
              onClick={handleNotAvailable}
            >
              Mega menu
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-mute"
              onClick={handleNotAvailable}
            >
              Blog
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 hover:text-mute"
              onClick={handleNotAvailable}
            >
              Pages
              <ChevronDown size={14} />
            </Link>
            <Link
              href="#"
              className="hover:text-mute"
              onClick={handleNotAvailable}
            >
              Contact
            </Link>
          </nav>

          {/* Support */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-cloud text-ink">
              <Headphones className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-ink">1900 - XXX</div>
              <div className="text-[11px] text-mute">24/7 Support Center</div>
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
          <div className="absolute inset-x-0 top-0 bg-canvas p-4 border-b border-hairline">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas text-ink"
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
                  className="flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm text-ink hover:bg-soft-cloud"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm text-ink hover:bg-soft-cloud"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
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
