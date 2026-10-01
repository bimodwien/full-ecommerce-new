'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/libraries/redux/hooks';
import { SidebarBrand, SidebarNav, SidebarUserMenu } from './sidebar-parts';
import { useSidebarLogout } from './use-sidebar-logout';

type PanelProps = {
  isLoggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
};

function MobileSidebarPanel({ isLoggingOut, onClose, onLogout }: PanelProps) {
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-64 bg-white border-r border-zinc-200 flex flex-col text-zinc-700">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <SidebarBrand />
        <SidebarNav disabled={isLoggingOut} onNavigate={onClose} />
        <SidebarUserMenu disabled={isLoggingOut} onLogout={onLogout} />
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggingOut, handleLogout } = useSidebarLogout();
  const user = useAppSelector((state) => state.auth);

  const shouldRender = (user && user.id) || isLoggingOut;
  if (!shouldRender) return null;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-white shadow-md text-zinc-700"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {isOpen && (
        <MobileSidebarPanel
          isLoggingOut={isLoggingOut}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
