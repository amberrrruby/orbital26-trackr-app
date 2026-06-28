"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Application } from "@/lib/generated/client";
import ReminderCard from "./ReminderCard";
import ReminderModal from "./ReminderModal";
import {
  GetApplicationsError,
  GetRemindersError,
  ReminderWithApplication,
  Result,
} from "@/lib/types";
import { Button } from "@/app/components/Button";
import styles from "./page.module.css";

const PREVIEW_LIMIT = 5;

type RemindersResult = Result<
  { reminders: ReminderWithApplication[]; totalCount: number },
  GetRemindersError
>;

type RemindersClientProps = {
  todayResult: RemindersResult;
  upcomingResult: RemindersResult;
  overdueResult: RemindersResult;
  applicationsResult: Result<Application[], GetApplicationsError>;
};

export default function RemindersPageClient({
  todayResult,
  upcomingResult,
  overdueResult,
  applicationsResult,
}: RemindersClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showAllToday, setShowAllToday] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [editingReminder, setEditingReminder] =
    useState<ReminderWithApplication | null>(null);

  if (
    !todayResult.ok ||
    !upcomingResult.ok ||
    !overdueResult.ok ||
    !applicationsResult.ok
  ) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load reminders. Please refresh the page.
      </div>
    );
  }

  const { reminders: todayReminders, totalCount: todayTotal } =
    todayResult.value;
  const { reminders: upcomingReminders, totalCount: upcomingTotal } =
    upcomingResult.value;
  const { reminders: overdueReminders, totalCount: overdueTotal } =
    overdueResult.value;
  const applications = applicationsResult.value;

  const grandTotal = todayTotal + upcomingTotal + overdueTotal;

  return (
    <>
      {/* modal for editing, conditional rendering handled by the modal itself*/}
      <ReminderModal
        key={editingReminder?.id ?? "create"}
        open={editingReminder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingReminder(null);
          }
        }}
        applications={applications}
        reminder={editingReminder ?? undefined}
      />
      {/* Page header */}
      <section className={styles.header}>
        <h1>Reminders</h1>
        <p>Stay on top of your deadlines and follow-ups.</p>
        <hr />
      </section>
      <section className={styles.addButton}>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add reminder
        </Button>
      </section>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          {
            label: "Today",
            value: todayTotal,
            variant: "today",
          },
          {
            label: "Upcoming",
            value: upcomingTotal,
            variant: "upcoming",
          },
          {
            label: "Overdue",
            value: overdueTotal,
            variant: "overdue",
          },
          {
            label: "Total",
            value: grandTotal,
            variant: "total",
          },
        ].map(({ label, value, variant }) => (
          <div key={label} className={styles.statCard} data-stat={variant}>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{value}</p>
          </div>
        ))}
      </div>

      <div className={styles.reminderList}>
        {/* Today */}
        <Section
          title="Today"
          count={todayTotal}
          showAll={showAllToday}
          onToggleShowAll={() => setShowAllToday((v) => !v)}
          hasMore={todayTotal > PREVIEW_LIMIT}
        >
          {todayReminders.map((r) => (
            <div
              key={r.id}
              onClick={() => setEditingReminder(r)}
              className={styles.reminderItem}
            >
              <ReminderCard key={r.id} reminder={r} />
            </div>
          ))}
        </Section>

        {/* Upcoming */}
        <Section
          title="Upcoming"
          count={upcomingTotal}
          showAll={showAllUpcoming}
          onToggleShowAll={() => setShowAllUpcoming((v) => !v)}
          hasMore={upcomingTotal > PREVIEW_LIMIT}
        >
          {upcomingReminders.map((r) => (
            <div
              key={r.id}
              onClick={() => setEditingReminder(r)}
              className={styles.reminderItem}
            >
              <ReminderCard key={r.id} reminder={r} />
            </div>
          ))}
        </Section>

        {/* Overdue */}
        <Section
          title="Overdue"
          count={overdueTotal}
          showAll={showAllOverdue}
          onToggleShowAll={() => setShowAllOverdue((v) => !v)}
          hasMore={overdueTotal > PREVIEW_LIMIT}
          variant="overdue"
        >
          {overdueReminders.map((r) => (
            <div
              key={r.id}
              onClick={() => setEditingReminder(r)}
              className={styles.reminderItem}
            >
              <ReminderCard key={r.id} reminder={r} variant="overdue" />
            </div>
          ))}
        </Section>
      </div>

      <ReminderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        applications={applications}
      />
    </>
  );
}

function Section({
  title,
  count,
  children,
  showAll,
  onToggleShowAll,
  hasMore,
  variant = "default",
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  showAll: boolean;
  onToggleShowAll: () => void;
  hasMore: boolean;
  variant?: "default" | "overdue";
}) {
  if (count === 0) return null;

  return (
    <section className={styles.reminderSection} data-variant={variant}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>{count}</span>
      </div>

      <div className={styles.sectionList}>{children}</div>
      {hasMore && (
        <button onClick={onToggleShowAll} className={styles.showAllButton}>
          {showAll ? "Show less" : `View all ${title.toLowerCase()}`}
        </button>
      )}
    </section>
  );
}
