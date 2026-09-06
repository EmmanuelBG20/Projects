"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatPrice } from "@/lib/utils";

export function SalesChart({ data }: { data: { date: string; total: number }[] }) {
  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111111" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#111111" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="#8a8a86" />
        <Tooltip
          formatter={(value: number) => formatPrice(value)}
          labelFormatter={(label) => `Día ${label}`}
          contentStyle={{ border: "1px solid #e5e1d8", borderRadius: 0, fontSize: 12 }}
        />
        <Area type="monotone" dataKey="total" stroke="#111111" strokeWidth={1.5} fill="url(#salesFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
