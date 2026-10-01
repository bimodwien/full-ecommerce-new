import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { axiosInstance } from '@/libraries/axios';
import type { GetCategoryResponse } from '@/models/category.model';

type CategoryValues = { name: string };

interface CategoryFormOptions {
  save: (values: CategoryValues) => Promise<unknown>;
  messages: { loading: string; success: string; error: string };
}

const initialValues: CategoryValues = { name: '' };

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Category name is required'),
});

const getErrorMessage = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (Array.isArray(data?.errors)) return data.errors.join(', ');
  return err?.message || fallback;
};

export function useCategoryForm({ save, messages }: CategoryFormOptions) {
  const router = useRouter();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const toastId = toast.loading(messages.loading);
      try {
        await save(values);
        toast.success(messages.success, { id: toastId });
        // small delay so the user can see the toast
        setTimeout(() => router.push('/dashboard/categories'), 600);
      } catch (err: any) {
        toast.error(getErrorMessage(err, messages.error), { id: toastId });
        console.error(`${messages.error}:`, err);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = await formik.validateForm();
    // mark fields as touched so inline errors show
    formik.setTouched({ name: true });
    if (Object.keys(errors).length > 0) {
      toast.error(errors.name || 'Please fix validation errors');
      return;
    }
    await formik.handleSubmit(e);
  };

  return { formik, handleSubmit };
}

export type CategoryFormState = ReturnType<typeof useCategoryForm>;

// Fills the form with the category being edited; returns true once it's loaded.
export function useLoadCategory(
  categoryId: string,
  setValues: (values: CategoryValues) => unknown,
) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await axiosInstance().get<GetCategoryResponse>(
          `/categories/${categoryId}`,
        );
        if (!mounted) return;
        setValues({ name: data.category?.name || '' });
        setLoaded(true);
      } catch (err) {
        toast.error('Failed to load category');
        console.error('Error loading category:', err);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [categoryId, setValues]);

  return loaded;
}
