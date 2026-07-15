"use client";

import { ResumeResponseRatePoint } from "@/lib/analytics-types";
import styles from "./ResumeResponseRateChart.module.css";

export default function ResumeResponseRateChart({
  data,
}: {
  data: ResumeResponseRatePoint[];
}) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Resume Version</th>
            <th className={styles.th}>Applications Used</th>
            <th className={styles.th}></th>
            <th className={styles.th}>Response Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.title}>
              <td className={styles.td}>{row.title}</td>
              <td className={styles.td}>{row.applicationCount}</td>
              <td className={styles.tdBar}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${row.responseRate}%` }}
                  />
                </div>
              </td>
              <td className={styles.tdRate}>{row.responseRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
