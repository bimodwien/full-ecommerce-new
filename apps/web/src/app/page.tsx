'use client';

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import Heroes from '@/components/homepage/heroes';
import ProductCardSection from '@/components/homepage/product-card-section';
import NewsLetter from '@/components/homepage/newsletter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <div className="mx-auto max-w-screen-2xl px-4 py-8 space-y-12">
        <div className="flex items-stretch gap-4">
          <div className="hidden lg:block w-72 shrink-0">
            <Suspense fallback={null}>
              <HomepageSidebar />
            </Suspense>
          </div>
          <div className="flex-1 min-w-0 space-y-12">
            <Heroes />
            <Suspense fallback={null}>
              <ProductCardSection />
            </Suspense>
          </div>
        </div>
        <NewsLetter />
      </div>
      <Footer />
    </>
  );
}
