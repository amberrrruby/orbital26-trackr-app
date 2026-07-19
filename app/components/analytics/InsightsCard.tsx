import type { LucideIcon } from "lucide-react";
import styles from "./InsightsCard.module.css";

interface InsightCardProps {
  title: string;
  middle: string | null;
  bottom: string | null;
  icon: LucideIcon;
}

export default function InsightsCard({
  title,
  middle,
  bottom,
  icon: Icon,
}: InsightCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap} aria-hidden="true">
        <Icon className={styles.icon} strokeWidth={1.8} />
      </div>

      <div className={styles.content}>
        <p className={styles.label}>{title}</p>
        <p className={styles.value}>{middle ?? "-"}</p>
        {bottom && <p className={styles.subMetric}>{bottom}</p>}
      </div>
    </div>
  );
}
