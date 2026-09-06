"use client";

import { SessionProvider } from "next-auth/react";
import { CartSyncProvider } from "@/components/providers/CartSyncProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartSyncProvider>{children}</CartSyncProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
