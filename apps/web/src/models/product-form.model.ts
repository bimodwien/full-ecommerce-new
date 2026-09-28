import type { FormikProps } from 'formik';

// Values of the seller's add/edit product form.
export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
};

export type ProductFormik = FormikProps<ProductFormValues>;

// `id` is set for variants that already exist on the server (edit page).
export type VariantRow = {
  key: string;
  id?: string;
  variant: string;
  stock: number;
  // Only used when "different price per variant" is on
  price: string;
};

export type RowField = 'variant' | 'stock' | 'price';
