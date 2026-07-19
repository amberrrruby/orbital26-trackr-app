"use client";

import { SourceBreakdownPoint } from "@/lib/analytics-types";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function SourceBreakdownChart({
  data,
}: {
  data: SourceBreakdownPoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 20, bottom: 8, left: 8 }}
      >
        <defs>
          <linearGradient id="sourceBarGradient" x1="0" y1="0" x2="1" y2="0">
            <stop
              offset="0%"
              stopColor="var(--chart-blue-3)"
              stopOpacity={0.95}
            />
            <stop
              offset="100%"
              stopColor="var(--chart-blue-1)"
              stopOpacity={0.75}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="var(--color-border)"
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          stroke="var(--color-text-tertiary)"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="source"
          width={90}
          stroke="var(--color-text-tertiary)"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--chart-tooltip-bg)",
            border: "1px solid var(--chart-tooltip-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            fontSize: "0.8rem",
          }}
          labelStyle={{
            color: "var(--chart-tooltip-label)",
            fontWeight: "var(--weight-medium)",
          }}
          itemStyle={{
            color: "var(--chart-tooltip-value)",
            fontWeight: "var(--weight-medium)",
          }}
          formatter={(v) => `${Number(v).toFixed(0)}%`}
        />

        <Bar
          dataKey="rate"
          fill="url(#sourceBarGradient)"
          activeBar={{
            fill: "var(--chart-blue-1)",
            opacity: 0.55,
          }}
          radius={[0, 6, 6, 0]}
          barSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
