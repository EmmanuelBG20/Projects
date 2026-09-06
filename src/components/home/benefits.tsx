import { Truck, RefreshCcw, ShieldCheck, Leaf } from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Envío gratis", description: "En pedidos superiores a $250.000 COP en todo el país." },
  { icon: RefreshCcw, title: "Devoluciones fáciles", description: "30 días para cambios y devoluciones sin costo." },
  { icon: ShieldCheck, title: "Pago seguro", description: "Wompi, Mercado Pago y Stripe con cifrado de extremo a extremo." },
  { icon: Leaf, title: "Materiales premium", description: "Algodón peinado y telas seleccionadas que duran temporadas." },
];

export function Benefits() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container grid grid-cols-2 gap-8 py-14 sm:py-16 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex flex-col items-start gap-3">
            <b.icon className="h-5 w-5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium">{b.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
