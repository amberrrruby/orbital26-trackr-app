import { requireUserOrRedirectLogin } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/analytics";

import InsightsRow from "@/app/components/analytics/InsightsRow";
import FunnelSection from "@/app/components/analytics/FunnelSection";
import ApplicationTrendChart from "@/app/components/analytics/ApplicationTrendChart";
import SourceBreakdownChart from "@/app/components/analytics/SourceBreakdownChart";
import ResumeResponseRateChart from "@/app/components/analytics/ResumeResponseRateChart";
import styles from "./page.module.css";

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
        <div>
          <h2>Application Trend</h2>
          <ApplicationTrendChart data={analytics.trend} />
        </div>

        <div>
          <h2>Source Breakdown</h2>
          <SourceBreakdownChart data={analytics.sourceBreakdown} />
        </div>
      </div>
      <div>
        <h2>Resume Response Rate</h2>
        <ResumeResponseRateChart data={analytics.resumeResponseRate} />
      </div>
    </main>
  );
}
