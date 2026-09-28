import { useState } from 'react';
import { VariantRow, newRowKey } from './types';

type RowField = 'variant' | 'stock';

const patchRow = (row: VariantRow, field: RowField, value: string) => ({
  ...row,
  [field]: field === 'stock' ? Number(value) || 0 : value,
});

export function useVariantRows() {
  const [variants, setVariants] = useState<VariantRow[]>([]);
  // Server-side variant ids the user removed (only used when editing).
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { key: newRowKey(), variant: '', stock: 0 },
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
    addVariant,
    updateVariant,
    removeVariant,
  };
}

export type VariantRowsState = ReturnType<typeof useVariantRows>;
