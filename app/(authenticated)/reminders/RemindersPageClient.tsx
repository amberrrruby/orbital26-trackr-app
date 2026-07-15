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
import ErrorDisplay from "@/app/components/ErrorDisplay";
import styles from "./page.module.css";

const PREVIEW_LIMIT = 5;

type RemindersResult = Result<ReminderWithApplication[], GetRemindersError>;

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
      <ErrorDisplay
        title="Failed to load reminders"
        message="Something went wrong. Please refresh the page and try again."
      />
    );
  }

  const todayReminders = todayResult.value;
  const todayTotal = todayReminders.length;
  const upcomingReminders = upcomingResult.value;
  const upcomingTotal = upcomingReminders.length;
  const overdueReminders = overdueResult.value;
  const overdueTotal = overdueReminders.length;
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
        >
          {(showAllToday
            ? todayReminders
            : todayReminders.slice(0, PREVIEW_LIMIT)
          ).map((r) => (
            <div
              key={r.id}
              onClick={() => setEditingReminder(r)}
              className={styles.reminderItem}
            >
              <ReminderCard key={r.id} reminder={r} variant="today" />
            </div>
          ))}
        </Section>

        {/* Upcoming */}
        <Section
          title="Upcoming"
          count={upcomingTotal}
          showAll={showAllUpcoming}
          onToggleShowAll={() => setShowAllUpcoming((v) => !v)}
        >
          {(showAllUpcoming
            ? upcomingReminders
            : upcomingReminders.slice(0, PREVIEW_LIMIT)
          ).map((r) => (
            <div
              key={r.id}
              onClick={() => setEditingReminder(r)}
              className={styles.reminderItem}
            >
              <ReminderCard key={r.id} reminder={r} variant="upcoming" />
            </div>
          ))}
        </Section>

        {/* Overdue */}
        <Section
          title="Overdue"
          count={overdueTotal}
          showAll={showAllOverdue}
          onToggleShowAll={() => setShowAllOverdue((v) => !v)}
          variant="overdue"
        >
          {(showAllOverdue
            ? overdueReminders
            : overdueReminders.slice(0, PREVIEW_LIMIT)
          ).map((r) => (
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
  variant = "default",
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  showAll: boolean;
  onToggleShowAll: () => void;
  variant?: "default" | "overdue";
}) {
  if (count === 0) return null;

  return (
    <section className={styles.reminderSection} data-variant={variant}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>{count}</span>
        {count > PREVIEW_LIMIT && (
          <button onClick={onToggleShowAll} className={styles.showAllButton}>
            {showAll ? "Show less" : `View all ${title.toLowerCase()}`}
          </button>
        )}
      </div>
      <div className={styles.sectionList}>{children}</div>
    </section>
  );
}
