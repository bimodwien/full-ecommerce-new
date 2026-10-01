'use client';
import React from 'react';
import { SidebarBrand, SidebarNav, SidebarUserMenu } from './sidebar-parts';
import { useSidebarLogout } from './use-sidebar-logout';

const Sidebar = () => {
  const { isLoggingOut, handleLogout } = useSidebarLogout();

  return (
    <div className="hidden lg:flex w-64 bg-white border-r border-zinc-200 flex-col">
      <SidebarBrand />
      <SidebarNav disabled={isLoggingOut} />
      <SidebarUserMenu disabled={isLoggingOut} onLogout={handleLogout} />
    </div>
  );
};

export default Sidebar;
