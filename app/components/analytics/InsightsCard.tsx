import styles from "./InsightsCard.module.css";

interface InsightCardProps {
  title: string;
  middle: string | null;
  bottom: string | null;
}

export default function InsightsCard({
  title,
  middle,
  bottom,
}: InsightCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWireframe} aria-hidden="true">
        <svg viewBox="0 0 40 40" className={styles.iconSvg}>
          <rect x="1" y="1" width="38" height="38" />
          <line x1="1" y1="1" x2="39" y2="39" />
          <line x1="39" y1="1" x2="1" y2="39" />
        </svg>
      </div>
      <div className={styles.content}>
        <p className={styles.label}>{title}</p>
        <p className={styles.value}>{middle ?? "-"}</p>
        {bottom && <p className={styles.subMetric}>{bottom}</p>}
      </div>
    </div>
  );
}
