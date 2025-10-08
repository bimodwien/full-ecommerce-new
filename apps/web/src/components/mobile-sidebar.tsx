'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  FolderOpen,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';
import { toast } from 'sonner';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Categories', href: '/dashboard/categories', icon: FolderOpen },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);

  const shouldRender = (user && user.id) || isLoggingOut;
  if (!shouldRender) return null;

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      const toastId = toast.loading('Logging out...');
      setTimeout(() => {
        toast.success('Logged out successfully', { id: toastId });
        setIsOpen(false);
        router.replace('/');
        dispatch(logout());
      }, 600);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative w-64 bg-white border-r border-zinc-200 flex flex-col text-zinc-700">
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Logo/Brand */}
            <div className="p-6 border-b border-zinc-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="TokoPakBimo Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-xl font-semibold text-zinc-800"
                  style={{ fontFamily: 'var(--font-bebas-neue)' }}
                >
                  TokoPakBimo
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav
              className={cn(
                'flex-1 p-4 space-y-2',
                isLoggingOut && 'pointer-events-none opacity-60',
              )}
            >
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Main Menu
              </div>
              {navigation.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-600 text-white border-r-2 border-emerald-600'
                        : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-zinc-200">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-60"
                  disabled={isLoggingOut}
                >
                  <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">TPB</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-zinc-800">
                      {user?.name || '—'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {user?.username || ''}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
