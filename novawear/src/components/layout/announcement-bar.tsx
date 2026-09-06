const MESSAGES = [
  "Envío gratis en pedidos superiores a $250.000 COP",
  "Nueva colección FW26 disponible ahora",
  "Cambios y devoluciones sin costo en 30 días",
];

export function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-border bg-primary text-primary-foreground">
      <div className="flex h-9 items-center">
        <div className="flex shrink-0 animate-marquee items-center gap-16 whitespace-nowrap pl-4 [animation-duration:28s]">
          {[...MESSAGES, ...MESSAGES].map((msg, i) => (
            <span key={i} className="text-[11px] uppercase tracking-widest">
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
