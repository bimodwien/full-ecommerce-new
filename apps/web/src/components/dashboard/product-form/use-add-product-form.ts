import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import {
  ProductFormValues,
  VariantRow,
  emptyProductValues,
  productSchema,
} from './types';
import { useVariantRows } from './use-variant-rows';
import { useAddProductImages } from './use-add-product-images';
import { sendProductForm, useCategories } from './submit-product';

function buildCreateFormData(
  values: ProductFormValues,
  descriptionHtml: string,
  variants: VariantRow[],
  files: File[],
) {
  const cleanVariants = variants
    .map((v) => ({ variant: v.variant.trim(), stock: Number(v.stock) || 0 }))
    .filter((v) => v.variant.length > 0);

  const fd = new FormData();
  fd.append('name', values.name);
  // Prefer HTML description so backend can store it as descriptionHtml
  fd.append('description', descriptionHtml || values.description);
  fd.append('price', String(values.price));
  fd.append('categoryId', values.categoryId);
  if (cleanVariants.length > 0)
    fd.append('variant', JSON.stringify(cleanVariants));
  files.forEach((f) => fd.append('image', f));
  return fd;
}

type CreateContext = {
  descriptionHtml: string;
  variants: VariantRow[];
  files: File[];
  onDone: () => void;
};

async function submitCreate(values: ProductFormValues, ctx: CreateContext) {
  if (ctx.files.length === 0) {
    toast.error('Please upload at least 1 product image');
    return;
  }
  const fd = buildCreateFormData(
    values,
    ctx.descriptionHtml,
    ctx.variants,
    ctx.files,
  );
  const ok = await sendProductForm(fd, {
    method: 'post',
    url: '/products',
    loading: 'Creating product...',
    success: 'Product created successfully',
    failure: 'Failed to create product',
    logLabel: 'Error submitting form: ',
  });
  if (ok) ctx.onDone();
}

export function useAddProductForm() {
  const router = useRouter();
  const categories = useCategories();
  const [descriptionHtml, setDescriptionHtml] = useState<string>('');
  const rows = useVariantRows();
  const images = useAddProductImages();

  const formik = useFormik({
    initialValues: emptyProductValues,
    validationSchema: productSchema,
    onSubmit: (values) =>
      submitCreate(values, {
        descriptionHtml,
        variants: rows.variants,
        files: images.files,
        onDone: () => router.push('/dashboard/products'),
      }),
  });

  return {
    router,
    formik,
    categories,
    descriptionHtml,
    setDescriptionHtml,
    rows,
    images,
  };
}
