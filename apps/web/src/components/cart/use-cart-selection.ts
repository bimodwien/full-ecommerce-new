import { useCallback, useState } from 'react';
import { TCart } from '@/models/cart.model';

function toggled(prev: Set<string>, id: string) {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function without(prev: Set<string>, id: string) {
  if (!prev.has(id)) return prev;
  const next = new Set(prev);
  next.delete(id);
  return next;
}

// Select every id, or clear them all if they're already all selected.
function toggledAll(prev: Set<string>, ids: string[]) {
  const next = new Set(prev);
  const allSelected = ids.every((id) => next.has(id));
  if (allSelected) ids.forEach((id) => next.delete(id));
  else ids.forEach((id) => next.add(id));
  return next;
}

// Checkbox selection over the currently filtered cart rows.
export function useCartSelection(filteredCarts: TCart[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allFilteredSelected =
    filteredCarts.length > 0 &&
    filteredCarts.every((c) => selectedIds.has(c.id));
  const someFilteredSelected = filteredCarts.some((c) => selectedIds.has(c.id));

  const toggleSelect = useCallback(
    (id: string) => setSelectedIds((prev) => toggled(prev, id)),
    [],
  );
  const unselect = useCallback(
    (id: string) => setSelectedIds((prev) => without(prev, id)),
    [],
  );
  const toggleSelectAll = useCallback(() => {
    const ids = filteredCarts.map((c) => c.id);
    setSelectedIds((prev) => toggledAll(prev, ids));
  }, [filteredCarts]);

  return {
    selectedIds,
    allFilteredSelected,
    someFilteredSelected,
    toggleSelect,
    unselect,
    toggleSelectAll,
  };
}
