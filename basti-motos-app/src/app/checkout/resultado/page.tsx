import Link from "next/link";
import { CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchWompiTransaction } from "@/lib/wompi";
import { centsToCOP } from "@/lib/money";

export const metadata = { title: "Resultado del pago — BASTI MOTOS" };

type SearchParams = Promise<{ id?: string }>;

/**
 * Wompi redirige aquí con `?id=<transactionId>` después del pago. Esta
 * página SOLO informa: la fuente de verdad del estado del pedido es nuestra
 * base de datos, actualizada por el webhook (`/api/webhooks/wompi`), nunca
 * lo que el navegador cree haber visto en Wompi.
 */
export default async function ResultadoPage({ searchParams }: { searchParams: SearchParams }) {
  const { id } = await searchParams;
  const session = await auth();

  if (!id) {
    return (
      <ResultShell
        icon={<HelpCircle size={48} className="text-neutral-500" />}
        title="No encontramos información de pago"
        message="Si acabas de intentar pagar, revisa tu correo o tu historial de pedidos."
      />
    );
  }

  let reference: string | null = null;
  try {
    const wompiTransaction = await fetchWompiTransaction(id);
    reference = wompiTransaction.reference;
  } catch (error) {
    console.error("[checkout/resultado] No se pudo consultar la transacción en Wompi:", error);
  }

  const payment = reference
    ? await prisma.payment.findUnique({ where: { reference }, include: { order: true } })
    : await prisma.payment.findFirst({ where: { transactionId: id }, include: { order: true } });

  if (!payment || (session?.user && payment.order.userId !== session.user.id)) {
    return (
      <ResultShell
        icon={<HelpCircle size={48} className="text-neutral-500" />}
        title="No encontramos ese pedido"
        message="Verifica tu historial de pedidos en tu cuenta."
      />
    );
  }

  if (payment.status === "APPROVED" && payment.order.status === "PAID") {
    return (
      <ResultShell
        icon={<CheckCircle2 size={48} className="text-neon-green" />}
        title="¡Pago aprobado!"
        message={`Tu pedido #${payment.order.id.slice(0, 8)} por ${centsToCOP(payment.order.totalCents)} fue confirmado.`}
        orderId={payment.order.id}
      />
    );
  }

  if (payment.status === "DECLINED" || payment.status === "ERROR" || payment.status === "VOIDED") {
    return (
      <ResultShell
        icon={<XCircle size={48} className="text-racing-red" />}
        title="El pago no se pudo completar"
        message="No te preocupes, no se realizó ningún cobro. Puedes intentarlo de nuevo desde tu carrito."
        orderId={payment.order.id}
      />
    );
  }

  return (
    <ResultShell
      icon={<Clock size={48} className="animate-pulse text-racing-orange" />}
      title="Confirmando tu pago"
      message="Wompi está confirmando la transacción con tu banco. Esto puede tardar unos segundos; te avisaremos por correo apenas se confirme."
      orderId={payment.order.id}
    />
  );
}

function ResultShell({
  icon,
  title,
  message,
  orderId,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  orderId?: string;
}) {
  return (
    <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
      {icon}
      <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
      <p className="max-w-md text-neutral-400">{message}</p>
      <div className="mt-4 flex gap-3">
        {orderId && (
          <Link href={`/mi-cuenta/pedidos/${orderId}`} className="btn-primary">
            Ver mi pedido
          </Link>
        )}
        <Link href="/productos" className="btn-ghost">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
