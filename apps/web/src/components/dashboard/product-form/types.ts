import type { FormikProps } from 'formik';
import * as Yup from 'yup';

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
};

export const emptyProductValues: ProductFormValues = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
};

export const productSchema = Yup.object({
  name: Yup.string().required('Product name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .required('Price is required')
    .min(0, 'Price must be >= 0'),
  categoryId: Yup.string().required('Category is required'),
});

export const newRowKey = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function getApiErrorMessage(err: any, fallback: string) {
  const data = err?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (Array.isArray(data?.errors)) return data.errors.join(', ');
  if (err?.message) return err.message;
  return fallback;
}
