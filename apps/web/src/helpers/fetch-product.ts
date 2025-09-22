import { axiosInstance } from '@/libraries/axios';
import { TProduct } from '@/models/product.model';
import type { Dispatch, SetStateAction } from 'react';

const axios = axiosInstance();

export const fetchProduct = async (
  setProducts: Dispatch<SetStateAction<TProduct[]>>,
) => {
  try {
    const response = await axios.get('/products');
    const products = (response.data?.products || []) as TProduct[];
    setProducts(products);
  } catch (error) {
    throw error;
  }
};

export const fetchProductDetail = async (id: string) => {
  try {
    const response = await axios.get(`/products/${id}`);
    const product = response.data?.product as TProduct;
    return product;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await axios.delete(`/products/${id}`);
  } catch (error) {
    throw error;
  }
};
