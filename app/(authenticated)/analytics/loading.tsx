import { Skeleton } from "@/app/components/Skeleton";
import pageStyles from "./page.module.css";
import loadingStyles from "./loading.module.css";
import insightsCardStyles from "@/app/components/analytics/InsightsCard.module.css";
import funnelStyles from "@/app/components/analytics/FunnelSection.module.css";
import insightsRowStyles from "@/app/components/analytics/InsightsRow.module.css";
import conversionCardStyles from "@/app/components/analytics/ConversionMetricCard.module.css";
import AnalyticsChartCardSkeleton from "@/app/components/analytics/AnalyticsChartCardSkeleton";
import resumeRateStyles from "@/app/components/analytics/ResumeResponseRateChart.module.css";

const INSIGHT_CARDS = Array.from({ length: 4 });
const FUNNEL_EXPLANATIONS = Array.from({ length: 4 });
const CONVERSION_CARDS = Array.from({ length: 3 });
const RESUME_RESPONSE_ROWS = Array.from({ length: 3 });

const FUNNEL_STAGE_CLASSES = [
  loadingStyles.funnelStageOne,
  loadingStyles.funnelStageTwo,
  loadingStyles.funnelStageThree,
  loadingStyles.funnelStageFour,
];

function InsightCardSkeleton() {
  return (
    <div className={`${insightsCardStyles.card} ${loadingStyles.insightCard}`}>
      <div className={insightsCardStyles.iconWrap}>
        <Skeleton className={loadingStyles.insightIcon} />
      </div>

      <div
        className={`${insightsCardStyles.content} ${loadingStyles.insightContent}`}
      >
        <Skeleton className={loadingStyles.insightLabel} />
        <Skeleton className={loadingStyles.insightValue} />
        <Skeleton className={loadingStyles.insightSubmetric} />
      </div>
    </div>
  );
}

function InsightsRowSkeleton() {
  return (
    <div className={insightsRowStyles.row}>
      {INSIGHT_CARDS.map((_, index) => (
        <InsightCardSkeleton key={`insight-${index}`} />
      ))}
    </div>
  );
}

function FunnelChartSkeleton() {
  return (
    <div className={loadingStyles.funnelChart}>
      {FUNNEL_STAGE_CLASSES.map((stageClass, index) => (
        <Skeleton
          key={`funnel-stage-${index}`}
          className={`${loadingStyles.funnelStage} ${stageClass}`}
        />
      ))}
    </div>
  );
}

function FunnelExplanationSkeleton() {
  return (
    <div className={funnelStyles.explanationItem}>
      <Skeleton className={loadingStyles.percentSkeleton} />

      <div className={loadingStyles.explanationCopy}>
        <Skeleton className={loadingStyles.explanationTitle} />
        <Skeleton className={loadingStyles.explanationText} />
        <Skeleton className={loadingStyles.explanationTextShort} />
      </div>
    </div>
  );
}

function ConversionCardSkeleton() {
  return (
    <div className={conversionCardStyles.card}>
      <Skeleton className={loadingStyles.conversionValue} />

      <div className={conversionCardStyles.content}>
        <Skeleton className={loadingStyles.conversionLabel} />
        <Skeleton className={loadingStyles.conversionHelper} />
      </div>
    </div>
  );
}

function FunnelSectionSkeleton() {
  return (
    <section className={funnelStyles.section}>
      <div className={funnelStyles.funnel}>
        <div className={funnelStyles.header}>
          <Skeleton className={loadingStyles.sectionTitle} />
          <Skeleton className={loadingStyles.sectionDescription} />
        </div>

        <div className={funnelStyles.funnelContent}>
          <div className={funnelStyles.chartWrap}>
            <FunnelChartSkeleton />
          </div>

          <div className={funnelStyles.explanations}>
            {FUNNEL_EXPLANATIONS.map((_, index) => (
              <FunnelExplanationSkeleton key={`explanation-${index}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={funnelStyles.conversions}>
        <div className={funnelStyles.header}>
          <Skeleton className={loadingStyles.sectionTitle} />
          <Skeleton className={loadingStyles.conversionDescription} />
          <Skeleton className={loadingStyles.conversionDescriptionShort} />
        </div>
        {CONVERSION_CARDS.map((_, index) => (
          <ConversionCardSkeleton key={`conversion-${index}`} />
        ))}
      </div>
    </section>
  );
}

function ResumeResponseRateSkeleton() {
  return (
    <div className={resumeRateStyles.wrapper}>
      <table className={resumeRateStyles.table}>
        <thead>
          <tr>
            <th className={resumeRateStyles.th}>
              <Skeleton className={loadingStyles.resumeHeaderTitel} />
            </th>

            <th className={resumeRateStyles.th}>
              <Skeleton className={loadingStyles.resumeHeaderCount} />
            </th>

            <th className={resumeRateStyles.th} />

            <th className={resumeRateStyles.th}>
              <Skeleton className={loadingStyles.resumeHeaderRate} />
            </th>
          </tr>
        </thead>

        <tbody>
          {RESUME_RESPONSE_ROWS.map((_, index) => (
            <tr key={`resume-response-${index}`}>
              <td className={resumeRateStyles.td}>
                <Skeleton className={loadingStyles.resumeName} />
              </td>

              <td className={resumeRateStyles.td}>
                <Skeleton className={loadingStyles.resumeCount} />
              </td>

              <td className={resumeRateStyles.tdBar}>
                <Skeleton className={loadingStyles.resumeBar} />
              </td>

              <td className={resumeRateStyles.tdRate}>
                <Skeleton className={loadingStyles.resumeRate} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalyticsLoading() {
  return (
    <main className={pageStyles.page}>
      <section className={pageStyles.header}>
        <Skeleton className={loadingStyles.pageTitle} />
        <Skeleton className={loadingStyles.pageSubtitle} />
      </section>

      <hr className={pageStyles.divider} />

      <div className={pageStyles.stack}>
        <InsightsRowSkeleton />
        <FunnelSectionSkeleton />
      </div>

      <div className={pageStyles.row}>
        <AnalyticsChartCardSkeleton />
        <AnalyticsChartCardSkeleton />
      </div>

      <AnalyticsChartCardSkeleton>
        <ResumeResponseRateSkeleton />
      </AnalyticsChartCardSkeleton>
    </main>
  );
}
