'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import WishlistCard from '@/components/wishlist/wishlist-card';
import { useAppSelector } from '@/libraries/redux/hooks';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

const Wishlist = () => {
  const auth = useAppSelector((s) => s.auth);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!auth.id) {
      toast.warning('You must be logged in to access the wishlist page.');
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [auth.id, router]);

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
              <Heart className="h-6 w-6 text-ink" />
              <h1 className="text-2xl font-medium text-ink">My Wishlist</h1>
            </div>
            <WishlistCard />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
