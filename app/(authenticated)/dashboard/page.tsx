import Link from "next/link";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import LogoutButton from "../LogoutButton";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { Reminder } from "@/lib/generated/client";
import { getDashboardData } from "@/lib/dashboard";
import DonutChartComponent from "@/app/components/dashboard/DonutChartComponent";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className={styles.summaryCard}>
      <p className={styles.summaryCardTitle}>{title}</p>
      <p className={styles.summaryCardValue}>{value}</p>
      <p className={styles.summaryCardSubtitle}>{subtitle}</p>
    </div>
  );
}

function ReminderRow({ item }: { item: Reminder }) {
  return (
    <div className={styles.reminderRow}>
      <span className={styles.reminderTitle}>{item.content}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Dashboard() {
  const userId = await requireUserOrRedirectLogin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(
      `Invariant error: Authenticated user ID ${userId} does NOT have a User record in the public User DB.`,
    );
  }

  const data = await getDashboardData(userId);

  return (
    <div className={styles.layout}>
      <div className={styles.mainWrapper}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <div className={styles.topbarRight}>
            <div className={styles.userMeta}>
              <span className={styles.userName}>
                {user.name ?? "(no name)"}
              </span>
              <span className={styles.userEmail}>{user.email ?? ""}</span>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className={styles.content}>
          <section className={styles.summaryRow} aria-label="Summary">
            <SummaryCard
              title="Total Tracked Applications"
              value={data.totalTracked}
              subtitle="All time"
            />
            <SummaryCard
              title="Total Active Applications"
              value={data.totalActive}
              subtitle="Applied, OA / Assessment, Interview"
            />
            <SummaryCard
              title="Reminders Needing Attention"
              value={data.attentionCount}
              subtitle="Due Today, Overdue"
            />
          </section>

          <section className={styles.midRow}>
            {/* Applications by Status */}
            <div className={styles.panel} aria-label="Applications by status">
              <h2 className={styles.panelTitle}>Applications by Status</h2>
              <div className={styles.chartContent}>
                <DonutChartComponent
                  total={data.totalTracked}
                  statusBreakdown={data.statusBreakdown}
                />
              </div>
            </div>

            {/* TODO: carry over styling from reminders page */}
            <div
              className={styles.panel}
              aria-label="Reminders needing attention"
            >
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  Reminders Needing Attention
                </h2>
                <Link href="/reminders" className={styles.viewAll}>
                  View All
                </Link>
              </div>

              <div className={styles.reminderGroup}>
                <h3 className={styles.reminderGroupTitle}>
                  Overdue ({data.reminders.overdue.length})
                </h3>
                {data.reminders.overdue.length === 0 ? (
                  <p className={styles.emptyState}>No overdue reminders.</p>
                ) : (
                  data.reminders.overdue.map((r) => (
                    <ReminderRow key={r.id} item={r} />
                  ))
                )}
              </div>

              <div className={styles.reminderGroup}>
                <h3 className={styles.reminderGroupTitle}>
                  Today ({data.reminders.today.length})
                </h3>
                {data.reminders.today.length === 0 ? (
                  <p className={styles.emptyState}>No reminders for today.</p>
                ) : (
                  data.reminders.today.map((r) => (
                    <ReminderRow key={r.id} item={r} />
                  ))
                )}
              </div>

              <div className={styles.reminderGroup}>
                <h3 className={styles.reminderGroupTitle}>
                  Upcoming Alerts ({data.reminders.upcoming.length})
                </h3>
                {data.reminders.upcoming.length === 0 ? (
                  <p className={styles.emptyState}>No upcoming alerts.</p>
                ) : (
                  data.reminders.upcoming.map((r) => (
                    <ReminderRow key={r.id} item={r} />
                  ))
                )}
              </div>
            </div>
          </section>

          <section className={styles.panel} aria-label="Recent applications">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Recent Applications</h2>
              <Link href="/applications" className={styles.viewAll}>
                View All
              </Link>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.tableEmpty}>
                        No applications yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.company}</td>
                        <td>{app.role}</td>
                        <td>{app.source ?? "—"}</td>
                        <td>{app.status}</td>
                        <td>{app.updatedAt.toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
