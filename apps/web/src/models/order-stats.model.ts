import type { OrderStatus } from './order.model';

export type TOrderStatsToday = {
  salesTotal: number;
  orderCount: number;
  cancelledCount: number;
};

export type TOrderTrendPoint = {
  date: string; // YYYY-MM-DD
  sales: number;
  orderCount: number;
};

export type TOrderStatusCount = {
  status: OrderStatus;
  count: number;
};

export type TTopCancelledProduct = {
  productId: string;
  productName: string;
  cancelledQuantity: number;
};

export type TOrderStats = {
  days: number;
  today: TOrderStatsToday;
  trend: TOrderTrendPoint[];
  statusBreakdown: TOrderStatusCount[];
  topCancelledProducts: TTopCancelledProduct[];
};
