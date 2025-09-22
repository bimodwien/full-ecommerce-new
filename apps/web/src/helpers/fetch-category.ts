import { axiosInstance } from '@/libraries/axios';
import { TCategory } from '@/models/category.model';
import type { Dispatch, SetStateAction } from 'react';

const axios = axiosInstance();

export const fetchCategory = async (
  setCategory: Dispatch<SetStateAction<TCategory[]>>,
) => {
  try {
    const response = await axios.get('/categories');
    const categories = (response.data?.categories || []) as TCategory[];
    setCategory(categories);
  } catch (error) {
    throw error;
  }
};
export const deleteCategory = async (id: string) => {
  try {
    await axios.delete(`/categories/${id}`);
  } catch (error) {
    throw error;
  }
};
