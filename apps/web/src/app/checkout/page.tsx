'use client';
import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import CheckoutSection from '@/components/checkout/checkout-section';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { CreditCard } from 'lucide-react';

const Checkout = () => {
  const allowed = useAuthGuard('You must be logged in to access checkout.');

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
              <CreditCard className="h-6 w-6 text-ink" />
              <h1 className="text-2xl font-medium text-ink">Checkout</h1>
            </div>
            <Suspense fallback={null}>
              <CheckoutSection />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
