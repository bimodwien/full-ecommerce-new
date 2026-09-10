'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchProduct } from '@/helpers/fetch-product';
import { fetchCategory } from '@/helpers/fetch-category';
import { fetchOrderStats } from '@/helpers/fetch-order';
import { TProductList } from '@/models/product.model';
import { TCategory } from '@/models/category.model';
import { TOrderStats } from '@/models/order-stats.model';
import DashboardStatsCards from '@/components/dashboard/dashboard-stats-cards';
import SalesTrendChart from '@/components/dashboard/sales-trend-chart';
import OrderStatusChart from '@/components/dashboard/order-status-chart';
import CancelledProductsChart from '@/components/dashboard/cancelled-products-chart';

const TREND_DAYS = 14;
const TOP_CANCELLED_LIMIT = 5;

const Dashboard = () => {
  const [products, setProducts] = useState<TProductList[]>([]);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [orderStats, setOrderStats] = useState<TOrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // fetch products and categories with unmount guard
    void fetchProduct((data) => {
      if (!mounted) return;
      setProducts(data);
    });
    void fetchCategory((data) => {
      if (!mounted) return;
      setCategories(data);
    });
    (async () => {
      try {
        const stats = await fetchOrderStats(TREND_DAYS, TOP_CANCELLED_LIMIT);
        if (!mounted) return;
        setOrderStats(stats);
      } catch {
        if (!mounted) return;
        toast.error('Failed to load order stats.');
      } finally {
        if (mounted) setStatsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
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

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-700 mb-4">
          Sales Overview
        </h2>
        <DashboardStatsCards
          today={orderStats?.today ?? null}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SalesTrendChart
            data={orderStats?.trend ?? []}
            days={orderStats?.days ?? TREND_DAYS}
            loading={statsLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart
            data={orderStats?.statusBreakdown ?? []}
            loading={statsLoading}
          />
        </div>
      </div>

      <div className="mb-8">
        <CancelledProductsChart
          data={orderStats?.topCancelledProducts ?? []}
          loading={statsLoading}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-700 mb-4">
          Product Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
            <h3 className="text-lg font-medium text-zinc-700 mb-2">
              Total Products
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {totalProduct}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
            <h3 className="text-lg font-medium text-zinc-700 mb-2">
              Categories
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {totalCategory}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
            <h3 className="text-lg font-medium text-zinc-700 mb-2">
              In Stock
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {inStockProduct}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
            <h3 className="text-lg font-medium text-zinc-700 mb-2">
              Low Stock
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {lowStockProduct}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
            <h3 className="text-lg font-medium text-zinc-700 mb-2">
              Out of Stock
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {outOfStockProduct}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
