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
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="weekStart" tickFormatter={formatWeek} />
        <YAxis allowDecimals={false} />
        <Tooltip labelFormatter={formatWeek} />
        <Line
          dataKey="count"
          type="monotone"
          dot={true}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
