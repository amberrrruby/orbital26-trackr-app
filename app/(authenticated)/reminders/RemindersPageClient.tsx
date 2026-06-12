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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Reminders</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <Plus size={16} />
          Add reminder
        </button>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          {
            label: "Today",
            value: todayTotal,
            accent: "text-blue-600 dark:text-blue-400",
          },
          { label: "Upcoming", value: upcomingTotal, accent: "" },
          { label: "Overdue", value: overdueTotal, accent: "text-destructive" },
          { label: "Total", value: grandTotal, accent: "" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-lg bg-muted/60 p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-medium ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

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
            className="cursor-pointer"
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
            className="cursor-pointer"
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
        titleAccent="text-destructive"
      >
        {overdueReminders.map((r) => (
          <div
            key={r.id}
            onClick={() => setEditingReminder(r)}
            className="cursor-pointer"
          >
            <ReminderCard key={r.id} reminder={r} variant="overdue" />
          </div>
        ))}
      </Section>

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
  titleAccent = "",
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  showAll: boolean;
  onToggleShowAll: () => void;
  hasMore: boolean;
  titleAccent?: string;
}) {
  if (count === 0) return null;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className={`text-base font-medium ${titleAccent}`}>{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
      {hasMore && (
        <button
          onClick={onToggleShowAll}
          className="mt-3 text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          {showAll ? "Show less" : `View all ${title.toLowerCase()}`}
        </button>
      )}
    </div>
  );
}
