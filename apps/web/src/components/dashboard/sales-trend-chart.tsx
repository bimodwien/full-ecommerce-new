'use client';
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR } from '@/lib/utils';
import { TOrderTrendPoint } from '@/models/order-stats.model';

interface SalesTrendChartProps {
  data: TOrderTrendPoint[];
  days: number;
  loading: boolean;
}

function formatDateLabel(dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: TOrderTrendPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium text-zinc-700 mb-1">
        {formatDateLabel(label)}
      </p>
      <p className="text-emerald-600">Sales: {formatIDR(point.sales)}</p>
      <p className="text-blue-600">Orders: {point.orderCount}</p>
    </div>
  );
}

const SalesTrendChart = ({ data, days, loading }: SalesTrendChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
      <h3 className="text-lg font-medium text-zinc-700 mb-4">
        Sales Trend (last {days} days)
      </h3>
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-zinc-400 text-sm">
          No order data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <ComposedChart
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f1"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={{ stroke: '#e4e4e7' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="sales"
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              width={48}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="orders"
              dataKey="orderCount"
              name="Orders"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            <Line
              yAxisId="sales"
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SalesTrendChart;
