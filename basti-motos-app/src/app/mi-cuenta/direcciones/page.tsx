import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "@/components/account/AddressManager";

export default async function DireccionesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <AddressManager addresses={addresses} />;
}
