'use client';
import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WishlistCard from '@/components/wishlist/wishlist-card';

type Props = {};

const Wishlist = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <div className="mx-auto max-w-screen-2xl px-4 min-h-lvh">
        <div className="flex items-stretch gap-4 py-8">
          <WishlistCard />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
