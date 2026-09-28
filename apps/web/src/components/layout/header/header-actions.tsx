import React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  ShoppingCart,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HeaderAuth } from './use-header-auth';
import { handleNotAvailable } from '../not-available';

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-canvas">
      {count}
    </span>
  );
}

type IconLinkProps = {
  auth: HeaderAuth;
  kind: 'wishlist' | 'cart';
  compact?: boolean; // mobile: icon only
};

// Wishlist / Cart button with a count badge; needs a session to open.
export function IconLink({ auth, kind, compact }: IconLinkProps) {
  const isCart = kind === 'cart';
  const label = isCart ? 'Cart' : 'Wishlist';
  const Icon = isCart ? ShoppingCart : Heart;
  return (
    <button
      type="button"
      onClick={() => auth.goProtected(isCart ? '/cart' : '/wishlist', label)}
      className={
        compact
          ? 'relative inline-flex items-center text-ink hover:text-mute'
          : 'group relative flex items-center gap-1 text-ink hover:text-mute'
      }
      aria-label={compact ? label : undefined}
    >
      <CountBadge count={isCart ? auth.cartCount : auth.wishlistCount} />
      <Icon className="h-6 w-6" />
      {!compact && <span>{label}</span>}
    </button>
  );
}

function AccountMenu({ auth }: { auth: HeaderAuth }) {
  if (!auth.isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1 text-ink hover:text-mute"
      >
        <User className="h-6 w-6" />
        <span>Login</span>
      </Link>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 cursor-pointer text-ink hover:text-mute">
          <User className="h-6 w-6" />
          <span className="max-w-45 truncate">
            hi,{' '}
            <span className="font-semibold first-letter:capitalize">
              {auth.shortName}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-none border-hairline"
      >
        <DropdownMenuItem
          onClick={auth.handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-ink">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Right side of the main row on desktop: location, wishlist, cart, account.
export function DesktopActions({ auth }: { auth: HeaderAuth }) {
  return (
    <div className="hidden items-center gap-4 lg:flex">
      <button
        className="ml-8 flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm text-ink hover:bg-soft-cloud md:ml-12"
        aria-label="Choose location"
        onClick={handleNotAvailable}
      >
        <MapPin className="h-4 w-4 text-ink" />
        <span>Your Location</span>
        <ChevronDown size={14} className="text-mute" />
      </button>
      <ul className="flex items-center gap-4 text-sm">
        <li>
          <IconLink auth={auth} kind="wishlist" />
        </li>
        <li>
          <IconLink auth={auth} kind="cart" />
        </li>
        <li>
          <AccountMenu auth={auth} />
        </li>
      </ul>
    </div>
  );
}
