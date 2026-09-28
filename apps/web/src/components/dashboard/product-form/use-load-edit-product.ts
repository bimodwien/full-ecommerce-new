import { useEffect } from 'react';
import { toast } from 'sonner';
import { fetchProductDetail } from '@/helpers/fetch-product';
import { TProduct, TProductImage } from '@/models/product.model';
import { ProductFormik, VariantRow } from './types';

type Setters = {
  formik: ProductFormik;
  setDescriptionHtml: (html: string) => void;
  setServerImages: (images: TProductImage[]) => void;
  setVariants: (rows: VariantRow[]) => void;
  setInitialLoaded: (loaded: boolean) => void;
};

function applyProduct(p: TProduct, s: Setters) {
  s.formik.setValues({
    name: p.name || '',
    description: (p.descriptionHtml || p.description || '')
      .replace(/<[^>]*>/g, '')
      .trim(),
    price: String(p.price ?? ''),
    categoryId: (p.categoryId as string) || p.Category?.id || '',
  });
  s.setDescriptionHtml(p.descriptionHtml || p.description || '');
  s.setServerImages(p.Images || []);
  s.setVariants(
    (p.Variants || []).map((v) => ({
      key: v.id,
      id: v.id,
      variant: v.variant,
      stock: v.stock,
    })),
  );
  s.setInitialLoaded(true);
}

// Loads the product once and fills the edit form with it.
export function useLoadEditProduct(productId: string, setters: Setters) {
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!productId) return;
      try {
        const p = await fetchProductDetail(productId);
        if (!mounted) return;
        applyProduct(p, setters);
      } catch (err) {
        toast.error('Failed to load product');
        console.error('Error loading product:', err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);
}
