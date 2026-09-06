import "server-only";
import { prisma } from "@/lib/prisma";
import { availableQuantity } from "@/lib/inventory";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(todayStart);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const revenueWhere = { status: { in: [...REVENUE_STATUSES] } };

  const [totalAgg, todayAgg, monthAgg, orderCount, customerCount, recentOrders, lowStockRows, topProductsRaw] =
    await Promise.all([
      prisma.order.aggregate({ where: revenueWhere, _sum: { total: true } }),
      prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: todayStart } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: monthStart } }, _sum: { total: true } }),
      prisma.order.count({ where: revenueWhere }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        where: { ...revenueWhere, createdAt: { gte: fourteenDaysAgo } },
        select: { total: true, createdAt: true },
      }),
      prisma.inventory.findMany({
        where: { quantity: { gt: 0 } },
        include: { variant: { include: { product: true } } },
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        where: { order: revenueWhere },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const totalSales = totalAgg._sum.total ?? 0;
  const todaySales = todayAgg._sum.total ?? 0;
  const monthSales = monthAgg._sum.total ?? 0;
  const avgTicket = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

  const salesByDay: { date: string; total: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    salesByDay.push({ date: key, total: 0 });
  }
  for (const order of recentOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = salesByDay.find((b) => b.date === key);
    if (bucket) bucket.total += order.total;
  }

  const lowStock = lowStockRows
    .map((inv) => ({
      productName: inv.variant.product.name,
      variantLabel: `${inv.variant.color} / ${inv.variant.size}`,
      available: availableQuantity(inv),
      threshold: inv.lowStockThreshold,
    }))
    .filter((r) => r.available <= r.threshold)
    .sort((a, b) => a.available - b.available)
    .slice(0, 8);

  const topProducts = topProductsRaw.map((p) => ({
    productId: p.productId,
    name: p.productName,
    quantity: p._sum.quantity ?? 0,
    revenue: p._sum.total ?? 0,
  }));

  return {
    totalSales,
    todaySales,
    monthSales,
    orderCount,
    avgTicket,
    customerCount,
    salesByDay,
    lowStock,
    topProducts,
  };
}
