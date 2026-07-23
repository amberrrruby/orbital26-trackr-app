import { ConversionMetrics, FunnelMetrics } from "@/lib/analytics-types";
import ConversionMetricCard from "./ConversionMetricCard";
import AnalyticsFunnelChart from "./FunnelChart";
import styles from "./FunnelSection.module.css";

type FunnelSectionProps = {
  funnelMetrics: FunnelMetrics;
  conversionMetrics: ConversionMetrics;
};

function getRate(count: number, submitted: number) {
  if (submitted == 0) return null;
  return Math.round((count / submitted) * 100);
}

function formatRate(rate: number | null) {
  return rate === null ? "-" : `${rate}%`;
}

export default function FunnelSection({
  funnelMetrics,
  conversionMetrics,
}: FunnelSectionProps) {
  const submitted = funnelMetrics.submitted;
  const funnelRates = {
    submitted: submitted === 0 ? null : 100,
    progressedBeyondApplied: getRate(
      funnelMetrics.progressedBeyondApplied,
      submitted,
    ),
    reachedInterview: getRate(funnelMetrics.reachedInterview, submitted),
    reachedOffer: getRate(funnelMetrics.reachedOffer, submitted),
  };

  const entries: { label: string; value: number | null; helper: string }[] = [
    {
      label: "Submitted → Progressed",
      value: conversionMetrics.submittedToProgressed,
      helper: "Moved beyond Applied",
    },
    {
      label: "OA/ Assessment → Interview",
      value: conversionMetrics.oaToInterview,
      helper: "Conversion from Assessment to Interview",
    },
    {
      label: "Interview → Offer",
      value: conversionMetrics.interviewToOffer,
      helper: "Conversion from Interview to Offer",
    },
  ];

  const funnelExplanations = [
    {
      title: "Submitted",
      rate: funnelRates.submitted,
      description: "All applications you have submitted",
    },
    {
      title: "Progressed beyond Applied",
      rate: funnelRates.progressedBeyondApplied,
      description:
        "Submitted applications that reached OA, Interview or Offer.",
    },
    {
      title: "Reached Interview",
      rate: funnelRates.reachedInterview,
      description: "Submitted applications that reached the Interview stage.",
    },
    {
      title: "Reached Offer",
      rate: funnelRates.reachedOffer,
      description: "Submitted applications that reached the Offer stage.",
    },
  ];
  return (
    <section className={styles.section}>
      <div className={styles.funnel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Funnel Metrics</h2>
          <p className={styles.description}>
            Stages are cumulative. Each stage shows how many submitted
            applications reached that point.
          </p>
        </div>

        <div className={styles.funnelContent}>
          <div className={styles.chartWrap}>
            <AnalyticsFunnelChart data={funnelMetrics} />
          </div>

          <div className={styles.explanations}>
            {funnelExplanations.map((item) => (
              <div key={item.title} className={styles.explanationItem}>
                <p className={styles.percent}>{formatRate(item.rate)}</p>

                <div>
                  <p className={styles.explanationTitle}>{item.title}</p>
                  <p className={styles.explanationText}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.conversions}>
        <div className={styles.header}>
          <h2 className={styles.title}>Conversion Rates</h2>
          <p className={styles.description}>
            Stage-to-stage rates showing how applications move between key
            milestones.
          </p>
        </div>
        {entries.map((cm) => (
          <ConversionMetricCard
            key={cm.label}
            label={cm.label}
            value={cm.value}
            helper={cm.helper}
          />
        ))}
      </div>
    </section>
  );
}
