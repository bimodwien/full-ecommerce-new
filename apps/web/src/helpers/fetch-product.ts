import { axiosInstance } from '@/libraries/axios';
import { TProduct, TProductList } from '@/models/product.model';
import type { Dispatch, SetStateAction } from 'react';

const axios = axiosInstance();

export type GetProductsQuery = {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | string;
};

export const fetchProduct = async (
  setProducts: Dispatch<SetStateAction<TProductList[]>>,
  params?: GetProductsQuery,
) => {
  try {
    const response = await axios.get('/products', { params });
    const products = (response.data?.products || []) as TProductList[];
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
