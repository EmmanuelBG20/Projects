import Link from "next/link";
import { UserMenu } from "@/components/layout/user-menu";
import type { Role } from "@/lib/constants";

export function AdminTopbar({ user }: { user: { name?: string | null; email?: string | null; role: Role } }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        ← Volver a la tienda
      </Link>
      <UserMenu user={user} />
    </header>
  );
}
