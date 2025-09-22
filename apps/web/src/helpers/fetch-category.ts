import { axiosInstance } from '@/libraries/axios';
import { TCategory } from '@/models/category.model';
import type { Dispatch, SetStateAction } from 'react';

export const fetchCategory = async (
  setCategory: Dispatch<SetStateAction<TCategory[]>>,
) => {
  const axios = axiosInstance();
  try {
    const response = await axios.get('/categories');
    const categories = (response.data?.categories || []) as TCategory[];
    setCategory(categories);
  } catch (error) {
    console.log(error);
  }
};
export const deleteCategory = async (id: string) => {
  const axios = axiosInstance();
  try {
    await axios.delete(`/categories/${id}`);
  } catch (error) {
    throw error;
  }
};
