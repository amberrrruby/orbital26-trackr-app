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
  const COLORS = [
    "var(--chart-blue-1)",
    "var(--chart-blue-2)",
    "var(--chart-blue-3)",
    "var(--chart-blue-4)",
  ];

  const chartData = [
    {
      name: "Submitted",
      value: data.submitted,
      label: `Submitted: ${data.submitted}`,
    },
    {
      name: "Progressed beyond Applied",
      value: data.progressedBeyondApplied,
      label: `Progressed: ${data.progressedBeyondApplied}`,
    },
    {
      name: "Reached Interview",
      value: data.reachedInterview,
      label: `Interview: ${data.reachedInterview}`,
    },
    {
      name: "Received Offer",
      value: data.reachedOffer,
      label: `Offer: ${data.reachedOffer}`,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <FunnelChart>
        <defs>
          {COLORS.map((color, i) => (
            <linearGradient
              key={i}
              id={`funnelGradient-${i}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.75} />
            </linearGradient>
          ))}
        </defs>

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-bg-overlay)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
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
            <Cell
              key={i}
              fill={`url(#funnelGradient-${i})`}
              stroke="var(--chart-funnel-stroke)"
            />
          ))}
          <LabelList
            dataKey="label"
            position="inside"
            style={{
              fontSize: "0.75rem",
              fill: "var(--color-text-inverse)",
              fontWeight: "600",
            }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
