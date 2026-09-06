import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountOverviewPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    include: { addresses: true, _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Datos personales</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:max-w-md">
          <div>
            <dt className="text-muted-foreground">Nombre</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Correo</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Teléfono</dt>
            <dd>{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cliente desde</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Direcciones</h2>
        {user.addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no tienes direcciones guardadas.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {user.addresses.map((address) => (
              <div key={address.id} className="border border-border p-4 text-sm">
                <p className="font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-muted-foreground">{address.line1}</p>
                {address.line2 && <p className="text-muted-foreground">{address.line2}</p>}
                <p className="text-muted-foreground">
                  {address.city}, {address.department}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-muted-foreground">Has realizado {user._count.orders} pedido(s).</p>
    </div>
  );
}
