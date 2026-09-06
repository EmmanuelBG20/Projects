import Link from "next/link";
import { Package, MapPin, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { centsToCOP } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

export default async function MiCuentaPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orderCount, addressCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.address.count({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div>
      <h1 className="section-title">Hola, {session!.user.name?.split(" ")[0]}</h1>
      <p className="section-subtitle">Gestiona tus pedidos, direcciones y datos personales.</p>

      <div className="grid gap-5 sm:grid-cols-3">
        <Link href="/mi-cuenta/pedidos" className="glass-card flex items-center gap-3 p-5 hover:border-racing-orange/40">
          <Package className="text-racing-orange" />
          <div>
            <p className="text-2xl font-bold text-white">{orderCount}</p>
            <p className="text-sm text-neutral-400">Pedidos realizados</p>
          </div>
        </Link>
        <Link href="/mi-cuenta/direcciones" className="glass-card flex items-center gap-3 p-5 hover:border-racing-orange/40">
          <MapPin className="text-racing-orange" />
          <div>
            <p className="text-2xl font-bold text-white">{addressCount}</p>
            <p className="text-sm text-neutral-400">Direcciones guardadas</p>
          </div>
        </Link>
        <Link href="/mi-cuenta/perfil" className="glass-card flex items-center gap-3 p-5 hover:border-racing-orange/40">
          <User className="text-racing-orange" />
          <div>
            <p className="text-sm font-semibold text-white">Mi perfil</p>
            <p className="text-sm text-neutral-400">Actualizar mis datos</p>
          </div>
        </Link>
      </div>

      <h2 className="mb-4 mt-10 font-display text-lg font-bold text-white">Pedidos recientes</h2>
      {recentOrders.length === 0 ? (
        <p className="glass-card p-6 text-neutral-400">Todavía no tienes pedidos.</p>
      ) : (
        <div className="glass-card divide-y divide-white/10">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/mi-cuenta/pedidos/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">#{order.id.slice(0, 8)}</p>
                <p className="text-sm text-neutral-500">{order.createdAt.toLocaleDateString("es-CO")}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{centsToCOP(order.totalCents)}</p>
                <p className="text-sm text-neutral-400">{ORDER_STATUS_LABELS[order.status]}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
