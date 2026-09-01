'use client';
import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  addWishlistEntry,
  removeWishlistEntry,
} from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount } from '@/libraries/redux/slices/cart.slice';
import { fetchCartCount } from '@/helpers/fetch-cart';
import { toast } from 'sonner';

const CLOTHING_SIZE_ORDER = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'xxl',
  'xxxl',
  '4xl',
  '5xl',
];

function compareVariants(a: string, b: string): number {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();

  const idxA = CLOTHING_SIZE_ORDER.indexOf(normA);
  const idxB = CLOTHING_SIZE_ORDER.indexOf(normB);
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;

  const groupA = normA
    .replace(/[\d/.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const groupB = normB
    .replace(/[\d/.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (groupA !== groupB) return groupA.localeCompare(groupB);

  const numA = parseFloat((normA.match(/\d+(\.\d+)?/) || [])[0] ?? '');
  const numB = parseFloat((normB.match(/\d+(\.\d+)?/) || [])[0] ?? '');
  const hasNumA = !Number.isNaN(numA);
  const hasNumB = !Number.isNaN(numB);
  if (hasNumA && hasNumB) return numA - numB;
  if (hasNumA) return -1;
  if (hasNumB) return 1;
  return normA.localeCompare(normB);
}

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
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const isLoggedIn = Boolean(auth.id);
  // Wishlist status must match the currently selected variant, not just
  // "this product has some wishlisted variant".
  const wishlisted = wishlistItems.some(
    (i) =>
      i.productId === id && (i.variantId ?? null) === (selectedVariantId ?? null),
  );
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
        if (p.Variants) {
          p.Variants = [...p.Variants].sort((a, b) =>
            compareVariants(a.variant, b.variant),
          );
        }
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
      if (result.added && result.wishlist) {
        dispatch(
          addWishlistEntry({
            id: result.wishlist.id,
            productId: id,
            variantId: selectedVariantId ?? null,
          }),
        );
      } else {
        dispatch(
          removeWishlistEntry({
            productId: id,
            variantId: selectedVariantId ?? null,
          }),
        );
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
    <div>
      <Header />
      <div className="mx-auto max-w-screen-2xl px-4 min-h-screen">
        <div className="flex items-stretch gap-4 py-8">
          <div className="flex-1 min-w-0">
            {!product ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Gallery */}
                  <div className="w-full md:w-96 shrink-0 md:self-start md:sticky md:top-8">
                    <div className="relative aspect-square w-full overflow-hidden bg-soft-cloud">
                      {selectedImageId ? (
                        <Image
                          src={`${imageBase}/products/image/${selectedImageId}`}
                          alt={product.name}
                          fill
                          sizes="(min-width: 768px) 384px, 100vw"
                          className="object-contain p-2"
                        />
                      ) : (
                        <Image
                          src="https://placehold.co/800x800/fff/aaa?text=No+Image"
                          alt="No image"
                          fill
                          sizes="(min-width: 768px) 384px, 100vw"
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
                              className={`relative aspect-square overflow-hidden bg-soft-cloud ${
                                active ? 'ring-2 ring-ink' : ''
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
                  <div className="flex-1 min-w-0">
                    <h1 className="text-ink text-2xl font-medium leading-8">
                      {product.name}
                    </h1>
                    <div className="text-ink text-xl font-medium leading-10">
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
                      <div className="space-y-2 mt-2">
                        <div className="text-sm text-mute">
                          Available Variants:
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                                className={`text-sm rounded-full border px-4 py-2 transition-colors ${
                                  disabled
                                    ? 'text-stone border-hairline cursor-not-allowed opacity-40'
                                    : active
                                      ? 'bg-ink text-canvas border-ink'
                                      : 'text-ink border-hairline hover:bg-soft-cloud'
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
                    {/* Qty + Add to cart */}
                    <div className="flex items-center gap-3 pt-5">
                      {/* Stepper with chevrons */}
                      <div className="flex items-stretch h-12 w-24 rounded-full border border-hairline overflow-hidden bg-canvas">
                        <div className="flex-1 flex items-center justify-center text-ink text-base">
                          {qty}
                        </div>
                        <div className="w-8 flex flex-col">
                          <button
                            type="button"
                            className="flex-1 flex items-center justify-center text-ink hover:bg-soft-cloud"
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
                            className="flex-1 flex items-center justify-center text-ink hover:bg-soft-cloud"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            aria-label="Decrease quantity"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Add to cart */}
                      <Button
                        size="pill"
                        onClick={handleAddToCart}
                        disabled={cartLoading}
                        className="font-medium tracking-wide flex items-center gap-1 disabled:opacity-60"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to cart
                      </Button>

                      <button
                        type="button"
                        onClick={handleWishlist}
                        disabled={wishlistLoading}
                        className="h-12 w-12 rounded-full bg-soft-cloud flex items-center justify-center transition-colors disabled:opacity-60"
                        aria-label={
                          wishlisted
                            ? 'Hapus dari wishlist'
                            : 'Tambah ke wishlist'
                        }
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            wishlisted ? 'fill-ink text-ink' : 'text-mute'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="h-12 w-12 rounded-full bg-soft-cloud text-mute flex items-center justify-center"
                        aria-label="Compare"
                      >
                        <Shuffle className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                      <h2 className="text-lg font-semibold text-ink mb-3">
                        Description
                      </h2>
                      <article
                        className="tiptap-content text-ink text-sm leading-7 space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            product.descriptionHtml ||
                              product.description ||
                              '',
                            { USE_PROFILES: { html: true } },
                          ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="hidden lg:block w-72 shrink-0 self-start sticky top-8">
            <Suspense fallback={null}>
              <HomepageSidebar />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PageDetail;
