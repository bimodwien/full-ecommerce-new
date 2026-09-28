import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, X } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import { HeaderAuth } from './use-header-auth';

type Props = { auth: HeaderAuth; onClose: () => void };

const pill =
  'flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-2 text-sm text-ink hover:bg-soft-cloud';

function AccountButton({ auth, onClose }: Props) {
  if (!auth.isLoggedIn) {
    return (
      <Link href="/login" className={pill} onClick={onClose}>
        <User className="h-5 w-5" />
        <span>Account</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={`${pill} w-full`}
      onClick={() => {
        onClose();
        auth.handleLogout();
      }}
    >
      <LogOut className="h-5 w-5" />
      <span>Logout</span>
    </button>
  );
}

// Mobile menu overlay: only search + account.
export default function MobileMenu({ auth, onClose }: Props) {
  const [mobileQuery, setMobileQuery] = useState('');
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 bg-canvas p-4 border-b border-hairline">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas text-ink"
            onClick={onClose}
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
          <AccountButton auth={auth} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
