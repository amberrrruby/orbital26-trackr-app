import Link from "next/link";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import LogoutButton from "../LogoutButton";
import { ApplicationStatusBadge } from "@/app/components/ApplicationStatusBadge";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { getDashboardData } from "@/lib/dashboard";
import DonutChartComponent from "@/app/components/dashboard/DonutChartComponent";
import { ReminderWithApplication, SOURCE_OPTIONS } from "@/lib/types";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function SummaryCard({
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

function getDaysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getReminderMessage(
  item: ReminderWithApplication,
  group: "overdue" | "today" | "upcoming_alerts",
) {
  if (group !== "upcoming_alerts") return item.content;

  const days = getDaysUntil(item.remindAt);

  if (days === 1) return `${item.content} due tomorrow`;
  return `${item.content} due in ${days} days`;
}

const REMINDER_ACCENT_CLASSES = {
  overdue: styles.reminderOverdue,
  today: styles.reminderToday,
  upcoming_alerts: styles.reminderUpcomingAlerts,
};

export function ReminderRow({
  item,
  group,
}: {
  item: ReminderWithApplication;
  group: "overdue" | "today" | "upcoming_alerts";
}) {
  return (
    <div
      className={[styles.reminderRow, REMINDER_ACCENT_CLASSES[group]].join(" ")}
    >
      <div className={styles.reminderContent}>
        <p className={styles.reminderTitle}>
          {item.application?.company}: {getReminderMessage(item, group)}
        </p>
        <p className={styles.reminderMeta}>{`${item.application?.role}`}</p>
      </div>

      <span className={styles.reminderDate}>
        {item.remindAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}
      </span>
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
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.description}>
              Hi {user.name ?? ""}! Here&apos;s your application activity at a
              glance.
            </p>
          </div>

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

        <hr />

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
              subtitle="Overdue, today, and upcoming alerts"
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

              <div className={styles.remindersContent}>
                <div className={styles.reminderGroup}>
                  <h3 className={styles.reminderGroupTitle}>
                    Overdue ({data.reminders.overdue.length})
                  </h3>
                  {data.reminders.overdue.length === 0 ? (
                    <p className={styles.emptyState}>No overdue reminders.</p>
                  ) : (
                    data.reminders.overdue.map((r) => (
                      <ReminderRow key={r.id} item={r} group="overdue" />
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
                      <ReminderRow key={r.id} item={r} group="today" />
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
                      <ReminderRow
                        key={r.id}
                        item={r}
                        group="upcoming_alerts"
                      />
                    ))
                  )}
                </div>
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
                        <td>{SOURCE_OPTIONS[app.source] ?? "—"}</td>
                        <td>
                          <ApplicationStatusBadge status={app.status} />
                        </td>
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
