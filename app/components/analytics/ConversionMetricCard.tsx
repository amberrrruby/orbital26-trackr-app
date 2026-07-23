"use client";

import styles from "./ConversionMetricCard.module.css";

type ConversionMetricCardProps = {
  label: string;
  value: number | null;
  helper?: string;
};

export default function ConversionMetricCard({
  label,
  value,
  helper,
}: ConversionMetricCardProps) {
  const displayValue = value !== null ? `${Math.round(value)}%` : "-";

  return (
    <div className={styles.card}>
      <p className={styles.value}>{displayValue}</p>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {helper && <p className={styles.helper}>{helper}</p>}
      </div>
    </div>
  );
}
