// Shared display helpers for product-bearing rows (cart, checkout, wishlist, detail).

export const API_BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
).replace(/\/$/, '');

const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function productImageUrl(imageOrProductId: string) {
  return `${API_BASE}/products/image/${imageOrProductId}`;
}

// List payloads carry the primary image's imageUrl; fall back to the
// product-id image route when it's missing.
export function listImageUrl(product: unknown, productId: string) {
  const rawImage = (product as any)?.Images?.[0]?.imageUrl as
    string | undefined;
  if (!rawImage) return productImageUrl(productId);
  return rawImage.startsWith('http')
    ? rawImage
    : `${API_ORIGIN}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
}

// Prisma Decimal comes over the wire as a string.
export function toPrice(price: string | number | null | undefined) {
  if (price == null) return 0;
  return typeof price === 'string' ? Number(price) : price;
}

export function matchesProductFilter(
  product: unknown,
  name: string,
  categoryId: string,
) {
  const p = product as any;
  const matchesName = name
    ? p?.name?.toLowerCase().includes(name.toLowerCase())
    : true;
  const matchesCategory = categoryId ? p?.categoryId === categoryId : true;
  return matchesName && matchesCategory;
}
