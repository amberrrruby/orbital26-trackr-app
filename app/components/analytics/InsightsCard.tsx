import type { LucideIcon } from "lucide-react";
import styles from "./InsightsCard.module.css";

interface InsightCardProps {
  title: string;
  middle: string | null;
  bottom: string | null;
  icon: LucideIcon;
  href?: string;
}

export default function InsightsCard({
  title,
  middle,
  bottom,
  icon: Icon,
  href,
}: InsightCardProps) {
  const content = (
    <>
      <div className={styles.iconWrap} aria-hidden="true">
        <Icon className={styles.icon} strokeWidth={1.8} />
      </div>

      <div className={styles.content}>
        <p className={styles.label}>{title}</p>
        <p className={styles.value}>{middle ?? "-"}</p>
        {bottom && <p className={styles.subMetric}>{bottom}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={styles.card}>
        {content}
      </a>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
