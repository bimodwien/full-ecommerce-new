'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useHeaderAuth } from './header/use-header-auth';
import { useHeaderSearch } from './header/use-header-search';
import SearchBox from './header/search-box';
import { DesktopActions, IconLink } from './header/header-actions';
import { BottomBar, TopBar } from './header/header-bars';
import MobileMenu from './header/mobile-menu';

function Logo() {
  return (
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
  );
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useHeaderAuth();
  const search = useHeaderSearch();
  const isHome = usePathname() === '/';

  return (
    <header className="w-full border-b border-hairline text-xs text-mute">
      <div className="mx-auto max-w-screen-2xl px-4">
        <TopBar />
        {/* Main header row: logo + search + actions */}
        <div className="grid grid-cols-3 items-center gap-3 py-4 lg:flex lg:items-center lg:justify-between lg:gap-6">
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
          <Logo />
          <SearchBox search={search} />
          <DesktopActions auth={auth} />
          <div className="lg:hidden justify-self-end flex items-center gap-4">
            <IconLink auth={auth} kind="wishlist" compact />
            <IconLink auth={auth} kind="cart" compact />
          </div>
        </div>
        <BottomBar search={search} isHome={isHome} />
      </div>
      {mobileMenuOpen && (
        <MobileMenu
          auth={auth}
          search={search}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
