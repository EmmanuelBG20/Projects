import { requireAdmin } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware.ts already blocks non-staff from /admin/*,
  // this re-checks server-side so no admin data can ever be fetched or
  // rendered based on a client-side assumption alone.
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopbar user={user} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
