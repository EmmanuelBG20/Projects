import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Segunda capa de defensa además del middleware: cualquier Server Action o
  // página de /admin vuelve a verificar el rol antes de tocar datos.
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="container-app py-12">
      <div className="mb-6">
        <span className="section-tag">Panel administrativo</span>
        <h1 className="font-display text-2xl font-bold text-white">BASTI MOTOS Admin</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AdminSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
