'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TOrderStatusCount } from '@/models/order-stats.model';
import { OrderStatus } from '@/models/order.model';

interface OrderStatusChartProps {
  data: TOrderStatusCount[];
  loading: boolean;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  SHIPPED: '#6366f1',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
  RETURNED: '#f97316',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

const OrderStatusChart = ({ data, loading }: OrderStatusChartProps) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100 h-full">
      <h3 className="text-lg font-medium text-zinc-700 mb-4">Order Status</h3>
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : total === 0 ? (
        <div className="h-72 flex items-center justify-center text-zinc-400 text-sm">
          No orders yet
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => [
                    value ?? 0,
                    STATUS_LABELS[item.payload.status as OrderStatus],
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-zinc-800">{total}</p>
              <p className="text-xs text-zinc-500">Total Orders</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
            {data.map((entry) => (
              <div
                key={entry.status}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                />
                <span className="text-zinc-600">
                  {STATUS_LABELS[entry.status]}
                </span>
                <span className="ml-auto font-medium text-zinc-800">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusChart;
