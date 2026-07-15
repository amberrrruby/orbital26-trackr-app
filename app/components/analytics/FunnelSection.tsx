import { ConversionMetrics, FunnelMetrics } from "@/lib/analytics-types";
import ConversionMetricCard from "./ConversionMetricCard";
import AnalyticsFunnelChart from "./FunnelChart";

type FunnelSectionProps = {
  funnelMetrics: FunnelMetrics;
  conversionMetrics: ConversionMetrics;
};

export default function FunnelSection({
  funnelMetrics,
  conversionMetrics,
}: FunnelSectionProps) {
  const entries: { label: string; value: number | null }[] = [
    {
      label: "Submitted to Progressed",
      value: conversionMetrics.submittedToProgressed,
    },
    {
      label: "OA to Interview conversion",
      value: conversionMetrics.oaToInterview,
    },
    {
      label: "Interview to Offer conversion",
      value: conversionMetrics.interviewToOffer,
    },
  ];

  return (
    <div>
      <div>
        <h2>Funnel Metrics</h2>
        <AnalyticsFunnelChart data={funnelMetrics} />
      </div>

      <div>
        <h2>Conversion Metrics</h2>
        {entries.map((cm) => (
          <ConversionMetricCard
            key={cm.label}
            label={cm.label}
            value={cm.value}
          />
        ))}
      </div>
    </div>
  );
}
