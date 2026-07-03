'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatIDR } from '@/lib/utils';
import {
  fetchCarts,
  updateCartQuantity,
  deleteCart,
} from '@/helpers/fetch-cart';
import { TCart } from '@/models/cart.model';
import { toast } from 'sonner';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { decrementCartCount } from '@/libraries/redux/slices/cart.slice';

const CartSection = () => {
  const dispatch = useAppDispatch();
  const [carts, setCarts] = useState<TCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const apiBase = (
    process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
  ).replace(/\/$/, '');
  const apiOrigin = apiBase.replace(/\/api\/?$/, '');

  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCarts();
      setCarts(data);
    } catch {
      toast.error('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCarts();
  }, [loadCarts]);

  const getImageUrl = (cart: TCart) => {
    const rawImage = (cart.Product as any)?.Images?.[0]?.imageUrl as
      | string
      | undefined;
    if (!rawImage) return `${apiBase}/products/image/${cart.productId}`;
    return rawImage.startsWith('http')
      ? rawImage
      : `${apiOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  };

  const handleQuantityChange = useCallback(
    async (cart: TCart, delta: number) => {
      const newQty = cart.quantity + delta;
      if (newQty < 1) return;
      setUpdatingId(cart.id);
      try {
        const updated = await updateCartQuantity(cart.id, newQty);
        setCarts((prev) =>
          prev.map((c) =>
            c.id === cart.id
              ? { ...c, quantity: updated.quantity ?? newQty }
              : c,
          ),
        );
      } catch {
        toast.error('Failed to update product quantity.');
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteCart(id);
        setCarts((prev) => prev.filter((c) => c.id !== id));
        dispatch(decrementCartCount());
        toast.success('Product removed from cart.');
      } catch {
        toast.error('Failed to remove product from cart.');
      } finally {
        setDeletingId(null);
      }
    },
    [dispatch],
  );

  const totalPrice = carts.reduce((acc, cart) => {
    const price = cart.Product
      ? typeof cart.Product.price === 'string'
        ? Number(cart.Product.price)
        : cart.Product.price
      : 0;
    return acc + price * cart.quantity;
  }, 0);

  const totalItems = carts.reduce((acc, c) => acc + c.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone">
        <ShoppingCart className="h-16 w-16 mb-4 text-stone" />
        <p className="text-lg font-medium text-ink">Your cart is empty</p>
        <p className="text-sm mt-1 mb-4 text-mute">
          Start shopping at the homepage.
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Cart items */}
      <div className="flex-1 flex flex-col gap-4">
        {carts.map((cart) => {
          const product = cart.Product;
          const priceNum = product
            ? typeof product.price === 'string'
              ? Number(product.price)
              : product.price
            : 0;
          const vendorName = (product as any)?.seller?.name || '';
          const categoryName = (product as any)?.Category?.name || '';
          const isUpdating = updatingId === cart.id;
          const isDeleting = deletingId === cart.id;

          return (
            <Card key={cart.id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-4 bg-canvas border border-hairline">
                {/* Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-soft-cloud">
                  <Image
                    src={getImageUrl(cart)}
                    alt={product?.name || 'Product'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-mute mb-0.5">
                    {categoryName}
                  </div>
                  <Link
                    href={`/detail/${cart.productId}`}
                    className="block text-sm font-medium text-ink hover:text-mute truncate"
                  >
                    {product?.name || 'Product name unavailable'}
                  </Link>
                  <div className="text-xs text-mute mt-0.5">
                    By <span className="text-mute">{vendorName}</span>
                  </div>
                  {cart.Variant && (
                    <div className="text-xs text-mute bg-soft-cloud px-2 py-0.5 w-fit mt-1">
                      Variant: {cart.Variant.variant}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-base font-medium text-ink">
                      {formatIDR(priceNum)}
                    </span>
                    {/* Quantity control */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(cart, -1)}
                        disabled={
                          isUpdating || isDeleting || cart.quantity <= 1
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium text-ink">
                        {cart.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(cart, 1)}
                        disabled={isUpdating || isDeleting}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cart.id)}
                        disabled={isUpdating || isDeleting}
                        aria-label="Remove product"
                        className="flex h-7 w-7 items-center justify-center rounded-full ml-2 bg-soft-cloud text-ink hover:bg-hairline-soft disabled:opacity-60"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-mute mt-1">
                    Subtotal:{' '}
                    <span className="font-medium text-ink">
                      {formatIDR(priceNum * cart.quantity)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order summary */}
      <div className="w-full lg:w-72 shrink-0">
        <Card className="sticky top-4">
          <CardContent className="p-5 bg-soft-cloud">
            <h2 className="text-lg font-medium text-ink mb-4">
              Order Summary
            </h2>
            <div className="flex justify-between text-sm text-mute mb-2">
              <span>Total items</span>
              <span>{totalItems} items</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-medium text-ink">
              <span>Total</span>
              <span>{formatIDR(totalPrice)}</span>
            </div>
            <Button
              size="pill"
              className="w-full mt-4"
              onClick={() => toast.info('Checkout belum tersedia')}
            >
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartSection;
