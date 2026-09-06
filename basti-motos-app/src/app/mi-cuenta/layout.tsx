import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  // El middleware ya protege /mi-cuenta/**; esta verificación es una segunda
  // capa de defensa por si el layout se renderiza sin pasar por el middleware
  // (por ejemplo, en pruebas o llamadas directas de Server Components).
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion?callbackUrl=/mi-cuenta");

  return (
    <div className="container-app py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
