"use client";

import { TrendPoint } from "@/lib/analytics-types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatWeek(date: unknown): string {
  return new Date(date as string).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ApplicationTrendChart({
  data,
}: {
  data: TrendPoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
      >
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="weekStart"
          tickFormatter={formatWeek}
          stroke="var(--color-text-tertiary)"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
          tickLine={false}
        />

        <YAxis
          allowDecimals={false}
          stroke="var(--color-text-tertiary)"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
          tickLine={false}
        />

        <Tooltip
          labelFormatter={formatWeek}
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
            marginBottom: "var(--space-1)",
          }}
          itemStyle={{
            color: "var(--chart-tooltip-value)",
            fontWeight: "var(--weight-medium)",
          }}
        />
        <Line
          dataKey="count"
          type="monotone"
          stroke="var(--chart-blue-2)"
          dot={{
            r: 3,
            fill: "var(--chart-blue-2)",
            stroke: "var(--color-bg-raised)",
            strokeWidth: 2,
          }}
          activeDot={{
            r: 5,
            fill: "var(--chart-blue-2)",
            stroke: "var(--color-bg-raised)",
            strokeWidth: 2,
          }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
