import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductDetail } from '@/helpers/fetch-product';
import { TProduct } from '@/models/product.model';
import { compareVariants } from './variant-sort';
import { useDetailActions } from './use-detail-actions';

// Fetches the product once per id, with variants in display order.
function useLoadProduct(id: string, onLoaded: (p: TProduct) => void) {
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
        onLoaded(p);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

export function useProductDetail() {
  const id = String(useParams<{ id: string }>()?.id || '');
  const [product, setProduct] = useState<TProduct | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [qty, setQty] = useState<number>(1);

  const selectedVariant = useMemo(
    () => product?.Variants?.find((v) => v.id === selectedVariantId) || null,
    [product, selectedVariantId],
  );

  useLoadProduct(id, (p) => {
    setProduct(p);
    const primary = p.Images?.find((img) => img.isPrimary);
    setSelectedImageId(primary?.id || p.Images?.[0]?.id || null);
    setSelectedVariantId(p.Variants?.[0]?.id || null);
    setQty(1);
  });

  const selectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQty(1);
  };

  const actions = useDetailActions(id, qty, selectedVariantId);
  return {
    product,
    selectedImageId,
    setSelectedImageId,
    selectedVariantId,
    selectedVariant,
    selectVariant,
    qty,
    setQty,
    ...actions,
  };
}

export type ProductDetailState = ReturnType<typeof useProductDetail>;
