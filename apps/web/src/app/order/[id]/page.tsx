'use client';
import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import OrderDetail from '@/components/order/order-detail';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Package } from 'lucide-react';

const OrderDetailPage = () => {
  const params = useParams<{ id: string }>();
  const allowed = useAuthGuard('You must be logged in to access your orders.');

  if (!allowed) return null;

  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <div className="mx-auto max-w-screen-2xl px-4 min-h-[80vh]">
        <div className="flex items-stretch gap-6 py-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <Suspense fallback={null}>
              <HomepageSidebar />
            </Suspense>
          </div>
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center gap-2">
              <Package className="h-6 w-6 text-ink" />
              <h1 className="text-2xl font-medium text-ink">Order Detail</h1>
            </div>
            <OrderDetail orderId={params.id} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetailPage;
