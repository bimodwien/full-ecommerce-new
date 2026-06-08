'use client';
import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import Header from '@/components/Header';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import { fetchProductDetail } from '@/helpers/fetch-product';
import { toggleWishlist } from '@/helpers/fetch-wishlist';
import { addToCart } from '@/helpers/fetch-cart';
import { TProduct } from '@/models/product.model';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import {
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  Heart,
  Shuffle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import {
  addWishlistProduct,
  removeWishlistProduct,
} from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount } from '@/libraries/redux/slices/cart.slice';
import { fetchCartCount } from '@/helpers/fetch-cart';
import { toast } from 'sonner';

function PageDetail() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id || '');
  const [product, setProduct] = useState<TProduct | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [qty, setQty] = useState<number>(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const wishlistProductIds = useAppSelector((s) => s.wishlist.productIds);
  const isLoggedIn = Boolean(auth.id);
  const wishlisted = wishlistProductIds.includes(id);
  const imageBase = useMemo(() => {
    const base =
      process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api';
    return base.replace(/\/$/, '');
  }, []);
  const selectedVariant = useMemo(
    () => product?.Variants?.find((v) => v.id === selectedVariantId) || null,
    [product, selectedVariantId],
  );
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      try {
        const p = await fetchProductDetail(id);
        if (!mounted) return;
        setProduct(p);
        const primary = p.Images?.find((img) => img.isPrimary);
        const first = p.Images?.[0];
        setSelectedImageId(primary?.id || first?.id || null);
        const firstVariant = p.Variants?.[0];
        setSelectedVariantId(firstVariant?.id || null);
        setQty(1);
      } catch (e) {
        // noop or show toast later
        console.error(e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to add to wishlist.');
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      const result = await toggleWishlist(id, selectedVariantId);
      if (result.added) {
        dispatch(addWishlistProduct(id));
      } else {
        dispatch(removeWishlistProduct(id));
      }
      toast.success(
        result.added ? 'Added to wishlist!' : 'Removed from wishlist.',
      );
    } catch {
      toast.error('Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  }, [isLoggedIn, wishlistLoading, id, selectedVariantId, dispatch]);

  const handleAddToCart = useCallback(async () => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to add to cart.');
      return;
    }
    if (cartLoading) return;
    setCartLoading(true);
    try {
      await addToCart(id, qty, selectedVariantId);
      const count = await fetchCartCount();
      dispatch(setCartCount(count));
      toast.success('Product added to cart!');
    } catch {
      toast.error('Failed to add to cart.');
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn, cartLoading, id, qty, selectedVariantId, dispatch]);

  return (
    <>
      <Header />
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex items-stretch gap-4 py-8">
          <div className="flex-1 min-w-0">
            {!product ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gallery */}
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-zinc-200 bg-white">
                      {selectedImageId ? (
                        <Image
                          src={`${imageBase}/products/image/${selectedImageId}`}
                          alt={product.name}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-contain p-2"
                        />
                      ) : (
                        <Image
                          src="https://placehold.co/800x800/fff/aaa?text=No+Image"
                          alt="No image"
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-contain p-2"
                        />
                      )}
                    </div>
                    {product.Images && product.Images.length > 1 && (
                      <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2">
                        {product.Images.map((img) => {
                          const url = `${imageBase}/products/image/${img.id}`;
                          const active = selectedImageId === img.id;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setSelectedImageId(img.id)}
                              className={`relative aspect-square rounded-lg overflow-hidden border ${
                                active
                                  ? 'border-emerald-500 ring-2 ring-emerald-300'
                                  : 'border-zinc-200 hover:border-zinc-300'
                              }`}
                              aria-label="Select image"
                            >
                              <Image
                                src={url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                              {img.isPrimary}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="">
                    <h1 className="justify-center text-slate-700 text-4xl font-bold font-['Quicksand'] leading-12">
                      {product.name}
                    </h1>
                    <div className="justify-center text-emerald-400 text-2xl font-bold font-['Quicksand'] leading-[58px]">
                      {typeof product.price === 'string'
                        ? Number(product.price).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          })
                        : product.price.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          })}
                    </div>
                    {product.Variants && product.Variants.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-zinc-500">
                          Available Variants:
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {product.Variants.map((v) => {
                            const active = selectedVariantId === v.id;
                            const disabled = v.stock <= 0;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  if (disabled) return;
                                  setSelectedVariantId(v.id);
                                  setQty(1);
                                }}
                                disabled={disabled}
                                className={`text-sm transition-colors ${
                                  disabled
                                    ? 'text-zinc-400 cursor-not-allowed px-2 py-1'
                                    : active
                                      ? 'bg-emerald-600 text-white rounded-md px-3 py-1.5'
                                      : 'text-zinc-700 hover:text-emerald-600 px-2 py-1'
                                }`}
                                aria-pressed={active}
                              >
                                {v.variant}
                                {disabled}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Qty + Add to cart (clean UI per screenshot) */}
                    <div className="flex items-center gap-3 pt-5">
                      {/* Stepper with chevrons */}
                      <div className="flex items-stretch h-12 w-24 rounded-[6px] border-2 border-emerald-400 overflow-hidden bg-white">
                        <div className="flex-1 flex items-center justify-center text-black text-base">
                          {qty}
                        </div>
                        <div className="w-8 flex flex-col">
                          <button
                            type="button"
                            className="flex-1 flex items-center justify-center text-emerald-500 hover:bg-emerald-50"
                            onClick={() => {
                              const max = selectedVariant?.stock ?? 99;
                              setQty((q) => Math.min(q + 1, max));
                            }}
                            aria-label="Increase quantity"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="flex-1 flex items-center justify-center text-emerald-500 hover:bg-emerald-50"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            aria-label="Decrease quantity"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Add to cart */}
                      <Button
                        onClick={handleAddToCart}
                        disabled={cartLoading}
                        className="h-12 px-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide flex items-center gap-2 disabled:opacity-60"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to cart
                      </Button>

                      {/* Optional placeholders to match screenshot spacing */}
                      <button
                        type="button"
                        onClick={handleWishlist}
                        disabled={wishlistLoading}
                        className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center transition-colors disabled:opacity-60 ${
                          wishlisted
                            ? 'border-red-400 bg-red-50 text-red-500'
                            : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                        }`}
                        aria-label={
                          wishlisted
                            ? 'Hapus dari wishlist'
                            : 'Tambah ke wishlist'
                        }
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            wishlisted ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="h-12 w-12 rounded-lg border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-50 flex items-center justify-center"
                        aria-label="Compare"
                      >
                        <Shuffle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-zinc-800 mb-6">
                    Description
                  </h2>
                  <article
                    className="text-zinc-700 text-sm leading-7 space-y-4"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        product.descriptionHtml || product.description || '',
                        { USE_PROFILES: { html: true } },
                      ),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="hidden lg:block w-72 shrink-0">
            <Suspense fallback={null}>
              <HomepageSidebar />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

export default PageDetail;
