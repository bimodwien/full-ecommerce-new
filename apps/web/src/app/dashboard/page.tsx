'use client';
import React, { useState, useEffect } from 'react';
import { fetchProduct } from '@/helpers/fetch-product';
import { fetchCategory } from '@/helpers/fetch-category';
import { TProduct } from '@/models/product.model';
import { TCategory } from '@/models/category.model';

const Dashboard = () => {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [categories, setCategories] = useState<TCategory[]>([]);

  useEffect(() => {
    fetchProduct(setProducts);
    fetchCategory(setCategories);
  }, []);

  const totalProduct = products.length;
  const totalCategory = categories.length;
  const inStockProduct = products.filter(
    (product) => product.stockStatus === 'IN_STOCK',
  ).length;
  const lowStockProduct = products.filter(
    (product) => product.stockStatus === 'LOW_STOCK',
  ).length;
  const outOfStockProduct = products.filter(
    (product) => product.stockStatus === 'OUT_OF_STOCK',
  ).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-700">Dashboard</h1>
        <p className="text-zinc-700">Welcome to TokoPakBimo dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
          <h3 className="text-lg font-medium text-zinc-700 mb-2">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-emerald-600">{totalProduct}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
          <h3 className="text-lg font-medium text-zinc-700 mb-2">Categories</h3>
          <p className="text-3xl font-bold text-emerald-600">{totalCategory}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
          <h3 className="text-lg font-medium text-zinc-700 mb-2">In Stock</h3>
          <p className="text-3xl font-bold text-emerald-600">
            {inStockProduct}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
          <h3 className="text-lg font-medium text-zinc-700 mb-2">Low Stock</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {lowStockProduct}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
          <h3 className="text-lg font-medium text-zinc-700 mb-2">
            Out of Stock
          </h3>
          <p className="text-3xl font-bold text-red-600">{outOfStockProduct}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
