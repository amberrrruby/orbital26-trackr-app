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

export default function InsightsRow({ data }: InsightsRowProps) {
  const {
    bestPerformingSource,
    bestPerformingResume,
    biggestDropOffStage,
    conversionMetrics,
    rejectionRate,
  } = data;
  return (
    // TODO: styling
    <div className={styles.row}>
      <InsightsCard
        title={"Best performing source"}
        middle={bestPerformingSource?.source ?? null}
        bottom={
          bestPerformingSource
            ? `Response rate: ${bestPerformingSource.rate}%`
            : null
        }
      />

      <InsightsCard
        title={"Best performing resume"}
        middle={bestPerformingResume?.title ?? null}
        bottom={
          bestPerformingResume
            ? `Response rate: ${bestPerformingResume.rate}%`
            : null
        }
      />

      <InsightsCard
        title={"Biggest drop-off stage"}
        middle={biggestDropOffStage}
        bottom={
          biggestDropOffStage &&
          (conversionMetrics[biggestDropOffStage] !== null
            ? `Only ${conversionMetrics[biggestDropOffStage]}% moved past this stage`
            : `-`)
        }
      />

      <InsightsCard
        title={"Rejection rate"}
        middle={rejectionRate ? `${rejectionRate}%` : `-`}
        bottom={`applications with current status Rejected`}
      />
    </div>
  );
}
