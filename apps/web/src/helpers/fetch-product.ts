import { axiosInstance } from '@/libraries/axios';
import { TProduct } from '@/models/product.model';
import type { Dispatch, SetStateAction } from 'react';

export const fetchProduct = async (
  setProducts: Dispatch<SetStateAction<TProduct[]>>,
) => {
  const axios = axiosInstance();
  try {
    const response = await axios.get('/products');
    const products = (response.data?.products || []) as TProduct[];
    setProducts(products);
  } catch (error) {
    console.log(error);
  }
};

export const deleteProduct = async (id: string) => {
  const axios = axiosInstance();
  try {
    await axios.delete(`/products/${id}`);
  } catch (error) {
    throw error;
  }
};
