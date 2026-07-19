import { requireUserOrRedirectLogin } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/analytics";

import InsightsRow from "@/app/components/analytics/InsightsRow";
import FunnelSection from "@/app/components/analytics/FunnelSection";
import AnalyticsChartCard from "@/app/components/analytics/AnalyticsChartCard";
import SourceBreakdownChart from "@/app/components/analytics/SourceBreakdownChart";
import ResumeResponseRateChart from "@/app/components/analytics/ResumeResponseRateChart";
import styles from "./page.module.css";
import ApplicationTrendChart from "@/app/components/analytics/ApplicationTrendChart";

// Data is per-user and changes often — do not statically cache this route.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const userId = await requireUserOrRedirectLogin();

  const analytics = await getAnalyticsData(userId);

  // return <pre>{JSON.stringify(analytics, null, 2)}</pre>;
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Analytics</h1>
        <p>Understand your performance and improve your job search strategy.</p>
      </section>
      <hr />
      <div>
        <InsightsRow data={analytics} />
        <FunnelSection
          funnelMetrics={analytics.funnelMetrics}
          conversionMetrics={analytics.conversionMetrics}
        />
      </div>

      <div className={styles.row}>
        <AnalyticsChartCard
          title="Application Trend"
          description="Applications submitted per week over the past month."
        >
          <ApplicationTrendChart data={analytics.trend} />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Source Breakdown"
          description="Response rate by application source."
        >
          <SourceBreakdownChart data={analytics.sourceBreakdown} />
        </AnalyticsChartCard>
      </div>

      <div>
        <AnalyticsChartCard
          title="Resume Response Rate"
          description="Response rate by resume used."
        >
          <ResumeResponseRateChart data={analytics.resumeResponseRate} />
        </AnalyticsChartCard>
      </div>
    </main>
  );
}
