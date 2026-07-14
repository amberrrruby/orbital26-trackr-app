"use client";

import { ResumeResponseRatePoint } from "@/lib/analytics-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ResumeResponseRateChart({
  data,
}: {
  data: ResumeResponseRatePoint[];
}) {
  // TODO: add applicationCount into graphics
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="title" width={55} />
        <Tooltip formatter={(v) => `${v}%`} />
        <Bar dataKey="responseRate" />
      </BarChart>
    </ResponsiveContainer>
  );
}
