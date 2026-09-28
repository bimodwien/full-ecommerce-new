import React from 'react';
import Link from 'next/link';
import { ChevronDown, Flame, Headphones, LayoutGrid } from 'lucide-react';
import CategoryMenu from './category-menu';
import { HeaderSearch } from './use-header-search';
import { handleNotAvailable } from '../not-available';

const Divider = () => <span className="h-3 w-px bg-hairline" />;
const SmDivider = () => (
  <span className="hidden h-3 w-px bg-hairline sm:block" />
);

function PickerButton({ label, aria }: { label: string; aria: string }) {
  return (
    <button
      className="hidden items-center gap-1 sm:flex hover:text-ink"
      aria-label={aria}
      onClick={handleNotAvailable}
    >
      <span>{label}</span>
      <ChevronDown size={14} className="text-mute" />
    </button>
  );
}

// Thin utility bar above the main header row (desktop only).
export function TopBar() {
  return (
    <div className="hidden h-9 items-center justify-between gap-4 lg:flex">
      <nav className="flex items-center gap-3">
        <Link href="#" className="hover:text-ink" onClick={handleNotAvailable}>
          About Us
        </Link>
        <Divider />
        <Link href="#" className="hover:text-ink" onClick={handleNotAvailable}>
          My Account
        </Link>
        <Divider />
        <Link href="/wishlist" className="hover:text-ink">
          Wishlist
        </Link>
        <Divider />
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
        <SmDivider />
        <PickerButton label="English" aria="Change language" />
        <SmDivider />
        <PickerButton label="IDR" aria="Change currency" />
      </div>
    </div>
  );
}

// Placeholder nav links; only Home is a real page so far.
const NAV_LINKS: { label: string; caret?: boolean }[] = [
  { label: 'About' },
  { label: 'Shop', caret: true },
  { label: 'Vendors', caret: true },
  { label: 'Mega menu', caret: true },
  { label: 'Blog', caret: true },
  { label: 'Pages', caret: true },
  { label: 'Contact' },
];

function MainNav({ isHome }: { isHome: boolean }) {
  return (
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
      {NAV_LINKS.map(({ label, caret }) => (
        <Link
          key={label}
          href="#"
          className={
            caret
              ? 'inline-flex items-center gap-1 hover:text-mute'
              : 'hover:text-mute'
          }
          onClick={handleNotAvailable}
        >
          {label}
          {caret && <ChevronDown size={14} />}
        </Link>
      ))}
    </nav>
  );
}

function Support() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft-cloud text-ink">
        <Headphones className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <div className="text-lg font-extrabold text-ink">1900 - XXX</div>
        <div className="text-[11px] text-mute">24/7 Support Center</div>
      </div>
    </div>
  );
}

type BottomProps = { search: HeaderSearch; isHome: boolean };

// Bottom row: browse-categories dropdown, main nav, support number.
export function BottomBar({ search, isHome }: BottomProps) {
  const trigger = (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-canvas hover:bg-ink/90"
    >
      <LayoutGrid className="h-5 w-5" />
      <span className="font-semibold">Browse All Categories</span>
      <ChevronDown size={16} className="opacity-90" />
    </button>
  );
  return (
    <div className="hidden items-center justify-between gap-6 border-t border-hairline-soft py-3 lg:flex">
      <CategoryMenu
        search={search}
        trigger={trigger}
        contentClassName="max-h-96 w-72 overflow-auto rounded-none border-hairline"
      />
      <MainNav isHome={isHome} />
      <Support />
    </div>
  );
}
