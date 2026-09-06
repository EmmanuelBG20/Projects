"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@/lib/constants";

export function UserMenu({ user }: { user: { name?: string | null; email?: string | null; role: Role } | null }) {
  const router = useRouter();

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Iniciar sesión"
        className="flex h-10 w-10 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </Link>
    );
  }

  const isStaff = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Cuenta"
        className="flex h-10 w-10 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name ?? user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">Mi cuenta</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">Mis pedidos</Link>
        </DropdownMenuItem>
        {isStaff && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Panel administrativo</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await logoutAction();
            router.push("/");
            router.refresh();
          }}
        >
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
