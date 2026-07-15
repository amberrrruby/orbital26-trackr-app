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
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "6px",
            color: "#f8fafc",
            fontSize: "0.8rem",
          }}
          formatter={(v) => `${v}%`}
        />
        <Bar
          dataKey="rate"
          fill="#6366f1"
          activeBar={{ fill: "#4f46e5" }}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
