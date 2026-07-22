import { Skeleton } from "@/app/components/Skeleton";
import styles from "./loading.module.css";

const SUMMARY_CARDS = Array.from({ length: 3 });
const REMINDER_CARDS = Array.from({ length: 2 });
const TABLE_ROWS = Array.from({ length: 5 });
const LEGEND = Array.from({ length: 6 });
const REMINDER_GROUPS = ["Overdue", "Today", "Upcoming Alerts"] as const;
const TABLE_COLUMNS = Array.from({ length: 5 });

function SummaryCardSkeleton() {
  return (
    <div className={styles.summaryCard}>
      <Skeleton className={styles.summaryCardTitle} />
      <Skeleton className={styles.summaryCardValue} />
      <Skeleton className={styles.summaryCardSubtitle} />
    </div>
  );
}

function ReminderRowSkeleton() {
  return (
    <div className={styles.reminderRow}>
      <div className={styles.reminderContent}>
        <Skeleton className={styles.reminderTitle} />
        <Skeleton className={styles.reminderMeta} />
      </div>
      <Skeleton className={styles.reminderDate} />
    </div>
  );
}

function ReminderGroupSkeleton({ groupIndex }: { groupIndex: number }) {
  return (
    <div className={styles.reminderGroup}>
      <Skeleton className={styles.reminderGroupTitle} />
      {REMINDER_CARDS.map((_, rowIndex) => (
        <ReminderRowSkeleton key={`reminder-${groupIndex}-${rowIndex}`} />
      ))}
    </div>
  );
}

function RecentApplicationsSkeleton() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <Skeleton className={styles.panelTitle} />
        <Skeleton className={styles.viewAll} />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <Skeleton className={styles.tableHeaderCompany} />
              </th>
              <th>
                <Skeleton className={styles.tableHeaderRole} />
              </th>
              <th>
                <Skeleton className={styles.tableHeaderSource} />
              </th>
              <th>
                <Skeleton className={styles.tableHeaderStatus} />
              </th>
              <th>
                <Skeleton className={styles.tableHeaderDate} />
              </th>
            </tr>
          </thead>

          <tbody>
            {TABLE_ROWS.map((_, rowIndex) => (
              <tr key={`application-${rowIndex}`}>
                <td>
                  <Skeleton className={styles.tableCompany} />
                </td>
                <td>
                  <Skeleton className={styles.tableRole} />
                </td>
                <td>
                  <Skeleton className={styles.tableSource} />
                </td>
                <td>
                  <Skeleton className={styles.tableStatus} />
                </td>
                <td>
                  <Skeleton className={styles.tableDate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DashboardLoading() {
  return (
    <div className={styles.layout}>
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Skeleton className={styles.title} />
            <Skeleton className={styles.subtitle} />
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.userMeta}>
              <Skeleton className={styles.userName} />
              <Skeleton className={styles.userEmail} />
            </div>
            <Skeleton className={styles.logoutButton} />
          </div>
        </header>

        <hr />

        <main className={styles.content}>
          <section className={styles.summaryRow}>
            {SUMMARY_CARDS.map((_, index) => (
              <SummaryCardSkeleton key={`summary-${index}`} />
            ))}
          </section>

          <section className={styles.midRow}>
            <div className={styles.panel}>
              <Skeleton className={styles.panelTitle} />

              <div className={styles.chartContent}>
                <Skeleton className={styles.chartDonut} />

                <div className={styles.chartLegend}>
                  {LEGEND.map((_, index) => (
                    <div
                      className={styles.chartLegendItem}
                      key={`legend-${index}`}
                    >
                      <Skeleton className={styles.chartLegendDot} />
                      <Skeleton className={styles.chartLegendLabel} />
                      <Skeleton className={styles.chartLegendValue} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <Skeleton className={styles.panelTitle} />
                <Skeleton className={styles.viewAll} />
              </div>

              <div className={styles.remindersContent}>
                {REMINDER_GROUPS.map((group, groupIndex) => (
                  <ReminderGroupSkeleton key={group} groupIndex={groupIndex} />
                ))}
              </div>
            </div>
          </section>

          <RecentApplicationsSkeleton />
        </main>
      </div>
    </div>
  );
}
