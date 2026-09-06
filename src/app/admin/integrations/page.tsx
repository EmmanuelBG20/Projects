import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { getIntegrationStatuses } from "@/lib/admin/integrations";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Integraciones" };

export default function AdminIntegrationsPage() {
  const integrations = getIntegrationStatuses();
  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Integraciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado de las credenciales configuradas en variables de entorno. Ninguna se muestra aquí — solo si están
          presentes o no.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {integrations
              .filter((i) => i.category === category)
              .map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-4 border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{i.description}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{i.envVars.join(" · ")}</p>
                  </div>
                  {i.connected ? (
                    <Badge variant="success" className="shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Conectado
                    </Badge>
                  ) : (
                    <Badge variant="muted" className="shrink-0">
                      <XCircle className="h-3 w-3" /> Sandbox
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
