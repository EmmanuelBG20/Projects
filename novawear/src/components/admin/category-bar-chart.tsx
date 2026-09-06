"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/utils";

export function CategoryBarChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e5e1d8" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#8a8a86" />
        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#8a8a86" width={40} />
        <Tooltip
          formatter={(value: number) => formatPrice(value)}
          contentStyle={{ border: "1px solid #e5e1d8", borderRadius: 0, fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#111111" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
