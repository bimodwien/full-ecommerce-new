import { useState } from 'react';
import type { RowField, VariantRow } from '@/models/product-form.model';
import { newRowKey } from './form-helpers';

const patchRow = (row: VariantRow, field: RowField, value: string) => ({
  ...row,
  [field]: field === 'stock' ? Number(value) || 0 : value,
});

export function useVariantRows() {
  const [variants, setVariants] = useState<VariantRow[]>([]);
  // Server-side variant ids the user removed (only used when editing).
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const [perVariantPrice, setPerVariantPrice] = useState(false);

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { key: newRowKey(), variant: '', stock: 0, price: '' },
    ]);

  const updateVariant = (key: string, field: RowField, value: string) =>
    setVariants((prev) =>
      prev.map((v) => (v.key === key ? patchRow(v, field, value) : v)),
    );

  const removeVariant = (key: string) =>
    setVariants((prev) => {
      const found = prev.find((v) => v.key === key);
      if (found?.id) setRemovedVariantIds((ids) => [...ids, found.id!]);
      return prev.filter((v) => v.key !== key);
    });

  return {
    variants,
    setVariants,
    removedVariantIds,
    perVariantPrice,
    setPerVariantPrice,
    addVariant,
    updateVariant,
    removeVariant,
  };
}

export type VariantRowsState = ReturnType<typeof useVariantRows>;
