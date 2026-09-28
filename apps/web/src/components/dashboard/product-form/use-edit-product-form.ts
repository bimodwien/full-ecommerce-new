import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import type {
  ProductFormik,
  ProductFormValues,
} from '@/models/product-form.model';
import { emptyProductValues, productSchema } from './form-helpers';
import { VariantRowsState, useVariantRows } from './use-variant-rows';
import {
  EditProductImages,
  useEditProductImages,
} from './use-edit-product-images';
import { useLoadEditProduct } from './use-load-edit-product';
import { sendProductForm, useCategories } from './submit-product';
import {
  productPricePayload,
  rowPricePayload,
  variantPriceError,
} from './variant-pricing';

type UpdateContext = {
  productId: string;
  descriptionHtml: string;
  rows: VariantRowsState;
  images: EditProductImages;
  onDone: () => void;
};

function buildUpdateFormData(values: ProductFormValues, ctx: UpdateContext) {
  const { rows, images } = ctx;
  const { perVariantPrice, variants } = rows;
  const variantUpdates = variants.map((v) => ({
    id: v.id,
    variant: v.variant.trim(),
    stock: Number(v.stock) || 0,
    price: rowPricePayload(v, perVariantPrice),
  }));
  const fd = new FormData();
  fd.append('name', values.name);
  fd.append('description', ctx.descriptionHtml || values.description);
  fd.append(
    'price',
    productPricePayload(values.price, variants, perVariantPrice),
  );
  fd.append('categoryId', values.categoryId);
  if (variantUpdates.length > 0)
    fd.append('variantUpdates', JSON.stringify(variantUpdates));
  if (rows.removedVariantIds.length > 0)
    fd.append('removeVariantIds', JSON.stringify(rows.removedVariantIds));
  if (images.removeImageIds.length > 0)
    fd.append('removeImageIds', JSON.stringify(images.removeImageIds));
  images.newFiles.forEach((f) => fd.append('image', f));
  return fd;
}

async function submitUpdate(values: ProductFormValues, ctx: UpdateContext) {
  if (ctx.images.totalEffectiveCount === 0) {
    toast.error('Please keep at least one product image');
    return;
  }
  const { variants, perVariantPrice } = ctx.rows;
  const priceError = variantPriceError(variants, perVariantPrice);
  if (priceError) {
    toast.error(priceError);
    return;
  }
  const ok = await sendProductForm(buildUpdateFormData(values, ctx), {
    method: 'patch',
    url: `/products/${ctx.productId}`,
    loading: 'Updating product...',
    success: 'Product updated successfully',
    failure: 'Failed to update product',
    logLabel: 'Error updating product:',
  });
  if (ok) setTimeout(ctx.onDone, 600);
}

// Show the first validation error in a toast after a submit attempt
function useFirstErrorToast(formik: ProductFormik) {
  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      const { errors } = formik;
      toast.error(
        errors.name ||
          errors.description ||
          errors.price ||
          errors.categoryId ||
          'Please fix validation errors',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.submitCount, formik.errors]);
}

function useEditFormik(ctx: UpdateContext) {
  const formik = useFormik({
    initialValues: emptyProductValues,
    enableReinitialize: true,
    validationSchema: productSchema(ctx.rows.perVariantPrice),
    onSubmit: (values) => submitUpdate(values, ctx),
  });
  useFirstErrorToast(formik);
  return formik;
}

export function useEditProductForm() {
  const router = useRouter();
  const productId = String(useParams<{ id: string }>()?.id || '');
  const [initialLoaded, setInitialLoaded] = useState(false);
  const categories = useCategories();
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const rows = useVariantRows();
  const images = useEditProductImages();
  const formik = useEditFormik({
    productId,
    descriptionHtml,
    rows,
    images,
    onDone: () => router.push('/dashboard/products'),
  });
  useLoadEditProduct(productId, {
    formik,
    setDescriptionHtml,
    setServerImages: images.setServerImages,
    setVariants: rows.setVariants,
    setPerVariantPrice: rows.setPerVariantPrice,
    setInitialLoaded,
  });

  return {
    router,
    formik,
    categories,
    descriptionHtml,
    setDescriptionHtml,
    rows,
    images,
    initialLoaded,
  };
}
