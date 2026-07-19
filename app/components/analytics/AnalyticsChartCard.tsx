import styles from "./AnalyticsChartCard.module.css";

type AnalyticsChartCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AnalyticsChartCard({
  title,
  description,
  children,
}: AnalyticsChartCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.chartWrap}>{children}</div>
    </section>
  );
}
