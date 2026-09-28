import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { axiosInstance } from '@/libraries/axios';
import { fetchCategory } from '@/helpers/fetch-category';
import { TCategory } from '@/models/category.model';
import { getApiErrorMessage } from './types';

export function useCategories() {
  const [categories, setCategories] = useState<TCategory[]>([]);
  useEffect(() => {
    fetchCategory(setCategories);
  }, []);
  return categories;
}

type SendOptions = {
  method: 'post' | 'patch';
  url: string;
  loading: string;
  success: string;
  failure: string;
  logLabel: string;
};

// Sends the multipart product form with loading/success/error toasts.
// Resolves true on success so the caller can navigate away.
export async function sendProductForm(fd: FormData, opts: SendOptions) {
  const toastId = toast.loading(opts.loading);
  try {
    await axiosInstance()[opts.method](opts.url, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success(opts.success, { id: toastId });
    return true;
  } catch (err: any) {
    toast.error(getApiErrorMessage(err, opts.failure), { id: toastId });
    console.error(opts.logLabel, err);
    return false;
  }
}
