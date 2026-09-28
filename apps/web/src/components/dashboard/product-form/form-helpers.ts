import type { ProductFormValues } from '@/models/product-form.model';
import * as Yup from 'yup';

export const emptyProductValues: ProductFormValues = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
};

// With per-variant pricing the product price is derived, so it isn't validated.
export const productSchema = (perVariantPrice = false) =>
  Yup.object({
    name: Yup.string().required('Product name is required'),
    description: Yup.string().required('Description is required'),
    price: perVariantPrice
      ? Yup.string()
      : Yup.number()
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
