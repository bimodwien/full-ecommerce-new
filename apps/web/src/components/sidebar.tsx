'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, FolderOpen, ChevronDown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Image from 'next/image';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Categories', href: '/dashboard/categories', icon: FolderOpen },
];

const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    try {
      dispatch(logout());
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
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
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'var(--font-bebas-neue)' }}
          >
            TokoPakBimo
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Main Menu
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? /* Changed active state to green #15AD39 with white text */
                    'text-white border-r-2'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
              )}
              style={
                isActive
                  ? { backgroundColor: '#15AD39', borderRightColor: '#15AD39' }
                  : {}
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">JS</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">John Smith</p>
              <p className="text-xs text-gray-500">Portfolio Owner</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
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
  );
};

export default Sidebar;
