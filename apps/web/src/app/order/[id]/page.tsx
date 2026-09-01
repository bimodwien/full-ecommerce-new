'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import OrderDetail from '@/components/order/order-detail';
import { useAppSelector } from '@/libraries/redux/hooks';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

const OrderDetailPage = () => {
  const auth = useAppSelector((s) => s.auth);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!auth.initialized) return;
    if (!auth.id) {
      toast.warning('You must be logged in to access your orders.');
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [auth.initialized, auth.id, router]);

  if (!checked) return null;

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
