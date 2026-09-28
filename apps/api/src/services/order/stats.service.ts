import { Request } from 'express';
import prisma from '@/prisma';
import { OrderStatus } from '@prisma/client';
import { requireUserId } from '../common.helpers';

const DAY_MS = 24 * 60 * 60 * 1000;

type StatsData = Awaited<ReturnType<typeof fetchStatsData>>;

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

// UTC calendar-day key, independent of server timezone.
function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fetchStatsData(
  sellerId: string,
  trendStart: Date,
  tomorrowStart: Date,
  topCancelledLimit: number,
) {
  return prisma.$transaction([
    prisma.order.findMany({
      where: { sellerId, createdAt: { gte: trendStart, lt: tomorrowStart } },
      select: { createdAt: true, status: true, totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { sellerId },
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { not: null },
        order: { sellerId, status: OrderStatus.CANCELLED },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: topCancelledLimit,
    }),
  ]);
}

function buildTrend(
  rangeOrders: StatsData[0],
  trendStart: Date,
  days: number,
  todayKey: string,
) {
  // Pre-seed every day in the window so the trend chart has no gaps.
  const buckets = new Map<string, { sales: number; orderCount: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(trendStart.getTime() + i * DAY_MS);
    buckets.set(toDateKey(d), { sales: 0, orderCount: 0 });
  }

  let cancelledToday = 0;
  for (const order of rangeOrders) {
    const key = toDateKey(order.createdAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.orderCount += 1;
    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.COMPLETED
    ) {
      bucket.sales += Number(order.totalAmount);
    }
    if (key === todayKey && order.status === OrderStatus.CANCELLED) {
      cancelledToday += 1;
    }
  }

  const trend = Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    sales: v.sales,
    orderCount: v.orderCount,
  }));
  const todayBucket = buckets.get(todayKey) ?? { sales: 0, orderCount: 0 };
  return { trend, todayBucket, cancelledToday };
}

function buildStatusBreakdown(statusGroups: StatsData[1]) {
  const statusCountMap = new Map(
    statusGroups.map((g) => [g.status, g._count._all]),
  );
  return Object.values(OrderStatus).map((status) => ({
    status,
    count: statusCountMap.get(status) ?? 0,
  }));
}

async function buildTopCancelled(cancelledItemGroups: StatsData[2]) {
  const cancelledProductIds = cancelledItemGroups
    .map((g) => g.productId)
    .filter((id): id is string => !!id);
  const cancelledProducts = cancelledProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: cancelledProductIds } },
        select: { id: true, name: true },
      })
    : [];
  const productNameById = new Map(cancelledProducts.map((p) => [p.id, p.name]));

  return cancelledItemGroups
    .filter((g): g is typeof g & { productId: string } => !!g.productId)
    .map((g) => ({
      productId: g.productId,
      productName: productNameById.get(g.productId) ?? 'Unknown product',
      cancelledQuantity: g._sum.quantity ?? 0,
    }));
}

class OrderStatsService {
  static async getAdminStats(req: Request) {
    const sellerId = requireUserId(req);
    const days = clamp(Number(req.query.days || 14), 7, 30);
    const topCancelledLimit = clamp(
      Number(req.query.topCancelledLimit || 5),
      1,
      20,
    );

    const todayKey = toDateKey(new Date());
    const todayStart = new Date(`${todayKey}T00:00:00.000Z`);
    const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
    const trendStart = new Date(todayStart.getTime() - (days - 1) * DAY_MS);

    const [rangeOrders, statusGroups, cancelledItemGroups] =
      await fetchStatsData(
        sellerId,
        trendStart,
        tomorrowStart,
        topCancelledLimit,
      );
    const { trend, todayBucket, cancelledToday } = buildTrend(
      rangeOrders,
      trendStart,
      days,
      todayKey,
    );

    return {
      days,
      today: {
        salesTotal: todayBucket.sales,
        orderCount: todayBucket.orderCount,
        cancelledCount: cancelledToday,
      },
      trend,
      statusBreakdown: buildStatusBreakdown(statusGroups),
      topCancelledProducts: await buildTopCancelled(cancelledItemGroups),
    };
  }
}

export default OrderStatsService;
