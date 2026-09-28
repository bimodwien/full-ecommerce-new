import type { VariantRow } from '@/models/product-form.model';

// Rows the form actually submits (blank names are dropped on create).
const namedRows = (rows: VariantRow[]) =>
  rows.filter((r) => r.variant.trim().length > 0);

const isValidPrice = (price: string) =>
  price.trim() !== '' && !Number.isNaN(Number(price)) && Number(price) >= 0;

export function cheapestRowPrice(rows: VariantRow[]) {
  const prices = namedRows(rows)
    .filter((r) => isValidPrice(r.price))
    .map((r) => Number(r.price));
  return prices.length > 0 ? Math.min(...prices) : undefined;
}

// Why the variant prices can't be submitted yet, or null if they can.
export function variantPriceError(
  rows: VariantRow[],
  perVariantPrice: boolean,
) {
  if (!perVariantPrice) return null;
  const named = namedRows(rows);
  if (named.length === 0) return 'Add at least one variant to price it';
  if (named.some((r) => !isValidPrice(r.price)))
    return 'Set a valid price for every variant';
  return null;
}

// Variant price sent to the API: null clears it back to the product price.
export const rowPricePayload = (row: VariantRow, perVariantPrice: boolean) =>
  perVariantPrice ? Number(row.price) : null;

// Product price sent to the API: the cheapest variant when priced per variant.
export function productPricePayload(
  formPrice: string,
  rows: VariantRow[],
  perVariantPrice: boolean,
) {
  if (!perVariantPrice) return String(formPrice);
  return String(cheapestRowPrice(rows) ?? '');
}
