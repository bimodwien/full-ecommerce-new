'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import WishlistItem from './wishlist-item';
import { useWishlist } from './use-wishlist';

const GRID =
  'flex-1 grid grid-cols-1 tablet-narrow:grid-cols-2 desktop-small:grid-cols-3 gap-2';

function EmptyWishlist() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 text-stone">
      <Heart className="h-16 w-16 mb-4 text-stone" />
      <p className="text-lg font-medium text-ink">Your wishlist is empty</p>
      <p className="text-sm mt-1 mb-4 text-mute">
        Add your favorite products from the homepage.
      </p>
      <Button asChild size="pill">
        <Link href="/">
          Go to homepage
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

const WishlistCard = () => {
  const state = useWishlist();

  if (state.loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }
  if (state.wishlists.length === 0) return <EmptyWishlist />;
  if (state.filteredWishlists.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <p className="text-base font-medium">No wishlist items found</p>
        <p className="text-sm">Try changing your search or filter.</p>
      </div>
    );
  }

  return (
    <div className={GRID}>
      {state.filteredWishlists.map((wishlist) => (
        <WishlistItem key={wishlist.id} wishlist={wishlist} state={state} />
      ))}
    </div>
  );
};

export default WishlistCard;
