'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TTopCancelledProduct } from '@/models/order-stats.model';

interface CancelledProductsChartProps {
  data: TTopCancelledProduct[];
  loading: boolean;
}

function truncateName(name: string, max = 22) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

const CancelledProductsChart = ({
  data,
  loading,
}: CancelledProductsChartProps) => {
  // Reversed so the highest-cancelled product renders at the top of the chart.
  const chartData = [...data].reverse();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
      <h3 className="text-lg font-medium text-zinc-700 mb-4">
        Top Cancelled Products (all time)
      </h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-zinc-400 text-sm">
          No cancelled items yet
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={Math.max(160, chartData.length * 44)}
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f0f0f1"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="productName"
              tickFormatter={(name: string) => truncateName(name)}
              tick={{ fontSize: 12, fill: '#3f3f46' }}
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <Tooltip
              formatter={(value) => [value ?? 0, 'Cancelled qty']}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="cancelledQuantity" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.productId} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CancelledProductsChart;
