const STYLES: Record<string, string> = {
  NUEVO: "bg-neon-green/15 text-neon-green border-neon-green/30",
  OFERTA: "bg-racing-red/15 text-racing-red border-racing-red/30",
  TOP_VENTAS: "bg-racing-orange/15 text-racing-orange border-racing-orange/30",
};

const LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  OFERTA: "Oferta",
  TOP_VENTAS: "Top ventas",
};

export function Badge({ tag }: { tag: string }) {
  const style = STYLES[tag] ?? "bg-white/10 text-white border-white/20";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      {LABELS[tag] ?? tag}
    </span>
  );
}
