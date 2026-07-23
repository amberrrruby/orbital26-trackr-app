"use client";

import { StatusCount } from "@/lib/dashboard-types";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./DonutChartComponent.module.css";

type DonutChartComponentProps = {
  total: number;
  statusBreakdown: StatusCount[];
};

const STATUS_COLORS: Record<string, string> = {
  WISHLIST: "var(--status-wishlist)",
  APPLIED: "var(--status-applied)",
  OA_ASSESSMENT: "var(--status-assessment)",
  INTERVIEW: "var(--status-interview)",
  OFFER: "var(--status-offer)",
  REJECTED: "var(--status-rejected)",
};

export default function DonutChartComponent({
  total,
  statusBreakdown,
}: DonutChartComponentProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusBreakdown}
              dataKey="count"
              nameKey="status"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {statusBreakdown.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={
                    STATUS_COLORS[entry.status] ?? "var(--color-text-tertiary)"
                  }
                />
              ))}
              <Label value="Total" position="center" dy={-10} />
              <Label value={total} position="center" dy={10} />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className={styles.legend}>
        {statusBreakdown.map(({ status, count }) => (
          <li key={status} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{
                backgroundColor:
                  STATUS_COLORS[status] ?? "var(--color-text-tertiary)",
              }}
            />
            <span className={styles.legendLabel}>{status}</span>
            <span className={styles.legendCount}>{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
