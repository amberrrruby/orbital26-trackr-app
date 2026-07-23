/*

+------------------------------------------+
| +-------+ +-------+ +-------+ +-------+  |
| | P SRC | | P RES | | P DOS | | P REJ |  |
| | I ??? | | I ??? | | I ?->?| | I ??? |  |
| | C ??% | | C ??% | | C ??% | | C ??% |  |
| +-------+ +-------+ +-------+ +-------+  |
+------------------------------------------+

Best performing source - ??? - ??%
Best performing resume - ??? - ??%
Biggest drop-off stage - ?? -> ?? - ??%
Rejection rate - ??%

*/

import { AnalyticsData } from "@/lib/analytics-types";
import InsightsCard from "./InsightsCard";
import { Trophy, FileText, TrendingDown, CircleX } from "lucide-react";
import styles from "./InsightsRow.module.css";

type InsightsRowProps = {
  data: Pick<
    AnalyticsData,
    | "bestPerformingSource"
    | "bestPerformingResume"
    | "biggestDropOffStage"
    | "conversionMetrics"
    | "rejectionRate"
  >;
};

function formatDropOffStage(stage: string | null) {
  if (!stage) return null;

  const labels: Record<string, string> = {
    submittedToProgressed: "Submitted → Progressed",
    oaToInterview: "OA/Assessment → Interview",
    interviewToOffer: "Interview → Offer",
  };

  return labels[stage] ?? stage;
}

export default function InsightsRow({ data }: InsightsRowProps) {
  const {
    bestPerformingSource,
    bestPerformingResume,
    biggestDropOffStage,
    conversionMetrics,
    rejectionRate,
  } = data;
  return (
    <div className={styles.row}>
      <InsightsCard
        icon={Trophy}
        href="#source-breakdown"
        title={"Best performing source"}
        middle={bestPerformingSource?.source ?? null}
        bottom={
          bestPerformingSource
            ? `Response rate: ${Math.round(bestPerformingSource.rate)}%`
            : null
        }
      />

      <InsightsCard
        icon={FileText}
        href="#resume-response-rate"
        title={"Best performing resume"}
        middle={bestPerformingResume?.title ?? null}
        bottom={
          bestPerformingResume
            ? `Response rate: ${Math.round(bestPerformingResume.rate)}%`
            : null
        }
      />

      <InsightsCard
        icon={TrendingDown}
        href="#funnel-metrics"
        title={"Biggest drop-off stage"}
        middle={formatDropOffStage(biggestDropOffStage)}
        bottom={
          biggestDropOffStage &&
          (conversionMetrics[biggestDropOffStage] !== null
            ? `Only ${conversionMetrics[biggestDropOffStage]}% moved past this stage`
            : `-`)
        }
      />

      <InsightsCard
        icon={CircleX}
        title={"Rejection rate"}
        middle={rejectionRate !== null ? `${rejectionRate}%` : `-`}
        bottom={`applications with current status Rejected`}
      />
    </div>
  );
}
