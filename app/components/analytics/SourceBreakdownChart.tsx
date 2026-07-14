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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="source" width={55} />
        <Tooltip formatter={(v) => `${v}%`} />
        <Bar dataKey="rate" />
      </BarChart>
    </ResponsiveContainer>
  );
}
