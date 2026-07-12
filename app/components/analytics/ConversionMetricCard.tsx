"use client";
import styles from "./ConversionMetricCard.module.css";

type ConversionMetricCardProps = {
  label: string;
  value: number | null;
};

export default function ConversionMetricCard({
  label,
  value,
}: ConversionMetricCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.value}>{value !== null ? `${value}%` : "-"}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
