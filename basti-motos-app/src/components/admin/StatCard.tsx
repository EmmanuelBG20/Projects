import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accent ? "bg-racing-orange/15 text-racing-orange" : "bg-white/5 text-neutral-300"}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xl font-bold text-white">{value}</p>
          <p className="text-sm text-neutral-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
