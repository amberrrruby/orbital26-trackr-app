"use client";

import { FunnelMetrics } from "@/lib/analytics-types";
import {
  FunnelChart,
  Funnel,
  ResponsiveContainer,
  LabelList,
  Tooltip,
} from "recharts";

export default function AnalyticsFunnelChart({
  data,
}: {
  data: FunnelMetrics;
}) {
  const chartData = [
    { name: "Submitted", value: data.submitted },
    { name: "Progressed", value: data.progressedBeyondApplied },
    { name: "Reached Interview", value: data.reachedInterview },
    { name: "Received Offer", value: data.reachedOffer },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <FunnelChart>
        <Tooltip />
        <Funnel
          dataKey="value"
          nameKey="name"
          data={chartData}
          lastShapeType="rectangle"
          isAnimationActive={true}
        >
          <LabelList dataKey="name" position="right" />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
