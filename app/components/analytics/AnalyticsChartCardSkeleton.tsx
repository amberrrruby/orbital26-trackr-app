import { Skeleton } from "@/app/components/Skeleton";
import styles from "./AnalyticsChartCard.module.css";

type AnalyticsChartCardSkeletonProps = {
  children?: React.ReactNode;
};

export default function AnalyticsChartCardSkeleton({
  children,
}: AnalyticsChartCardSkeletonProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonDescription} />
      </div>

      <div className={styles.chartWrap}>
        {children ?? <Skeleton className={styles.skeletonChart} />}
      </div>
    </section>
  );
}
