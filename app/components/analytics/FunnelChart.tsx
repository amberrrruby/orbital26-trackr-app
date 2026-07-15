"use client";

import { FunnelMetrics } from "@/lib/analytics-types";
import {
  FunnelChart,
  Funnel,
  ResponsiveContainer,
  LabelList,
  Tooltip,
  Cell,
} from "recharts";

export default function AnalyticsFunnelChart({
  data,
}: {
  data: FunnelMetrics;
}) {
  // TODO: Remove hardcoded
  const COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

  const chartData = [
    { name: "Submitted", value: data.submitted },
    { name: "Progressed", value: data.progressedBeyondApplied },
    { name: "Reached Interview", value: data.reachedInterview },
    { name: "Received Offer", value: data.reachedOffer },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <FunnelChart>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "6px",
            color: "#f8fafc",
            fontSize: "0.8rem",
          }}
        />
        <Funnel
          dataKey="value"
          nameKey="name"
          data={chartData}
          lastShapeType="rectangle"
          isAnimationActive={true}
        >
          {chartData.map((_, i) => (
            // TODO: Remove hardcoded
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList
            dataKey="name"
            position="inside"
            style={{ fontSize: "0.8rem", fill: "#ffffcc" }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
