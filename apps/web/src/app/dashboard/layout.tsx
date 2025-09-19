import type { Metadata } from 'next';
import Sidebar from '@/components/sidebar';
import { MobileSidebar } from '@/components/mobile-sidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard for managing your e-commerce store',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white">
      <MobileSidebar />
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
