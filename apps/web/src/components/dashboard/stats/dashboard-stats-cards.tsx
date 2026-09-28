'use client';
import React from 'react';
import { Wallet, ShoppingCart, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR } from '@/lib/utils';
import { TOrderStatsToday } from '@/models/order-stats.model';

interface DashboardStatsCardsProps {
  today: TOrderStatsToday | null;
  loading: boolean;
}

const DashboardStatsCards = ({ today, loading }: DashboardStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-zinc-700">
            Today&apos;s Sales
          </h3>
          <Wallet className="w-5 h-5 text-emerald-600" />
        </div>
        {loading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <p className="text-3xl font-bold text-emerald-600">
            {formatIDR(today?.salesTotal ?? 0)}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-zinc-700">
            Today&apos;s Orders
          </h3>
          <ShoppingCart className="w-5 h-5 text-blue-600" />
        </div>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-bold text-blue-600">
            {today?.orderCount ?? 0}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-zinc-700">
            Today&apos;s Cancelled
          </h3>
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-bold text-red-600">
            {today?.cancelledCount ?? 0}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardStatsCards;
