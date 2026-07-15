import { ConversionMetrics, FunnelMetrics } from "@/lib/analytics-types";
import ConversionMetricCard from "./ConversionMetricCard";
import AnalyticsFunnelChart from "./FunnelChart";
import styles from "./FunnelSection.module.css";

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
    <div className={styles.section}>
      <div className={styles.funnel}>
        <p className={styles.heading}>Funnel Metrics</p>
        <AnalyticsFunnelChart data={funnelMetrics} />
      </div>

      <div className={styles.conversions}>
        <p className={styles.heading}>Conversion Metrics</p>
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
