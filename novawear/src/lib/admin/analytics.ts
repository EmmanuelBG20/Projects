import "server-only";
import { prisma } from "@/lib/prisma";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export async function getCategoryBreakdown() {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: [...REVENUE_STATUSES] } } },
    select: { total: true, quantity: true, product: { select: { category: { select: { name: true } } } } },
  });

  const map = new Map<string, { revenue: number; quantity: number }>();
  for (const item of items) {
    const key = item.product.category.name;
    const existing = map.get(key) ?? { revenue: 0, quantity: 0 };
    existing.revenue += item.total;
    existing.quantity += item.quantity;
    map.set(key, existing);
  }

  return [...map.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getOrderStatusBreakdown() {
  const rows = await prisma.order.groupBy({ by: ["status"], _count: true });
  return rows.map((r) => ({ status: r.status, count: r._count }));
}

export async function getPaymentMethodBreakdown() {
  const rows = await prisma.payment.groupBy({ by: ["provider"], where: { status: "APPROVED" }, _count: true, _sum: { amount: true } });
  return rows.map((r) => ({ provider: r.provider, count: r._count, amount: r._sum.amount ?? 0 }));
}
