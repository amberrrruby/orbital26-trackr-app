"use client";

import { useState } from "react";
import { Bell, TriangleAlert, MoveUpRight } from "lucide-react";
import { deleteReminder, completeReminder } from "@/app/actions/reminders";
import { useRouter } from "next/navigation";
import { ReminderWithApplication } from "@/lib/types";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/Button";
import styles from "./ReminderCard.module.css";

interface ReminderCardProps {
  reminder: ReminderWithApplication;
  variant?: "today" | "upcoming" | "overdue";
}

export default function ReminderCard({ reminder, variant }: ReminderCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const isOverdue = variant === "overdue";

  const ReminderIcon = isOverdue ? TriangleAlert : Bell;

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(reminder.remindAt));

  async function handleDismiss(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setError(null);
    setIsDismissing(true);

    const result = await deleteReminder(reminder.id);
    setIsDismissing(false);
    if (!result.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  async function handleComplete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setError(null);
    setIsCompleting(true);

    const result = await completeReminder(reminder.id);
    setIsCompleting(false);
    if (!result.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className={styles.card} data-variant={variant}>
      <div className={styles.mainRow}>
        <div className={styles.reminderInfo}>
          <div className={styles.iconWrapper}>
            <ReminderIcon size={18} className={styles.icon} />
          </div>

          <div className={styles.text}>
            <p className={styles.content}>{reminder.content}</p>
            <div className={styles.metadata}>
              {reminder.application && (
                <Link
                  href={`/applications/${reminder.applicationId}`}
                  className={styles.applicationLink}
                  onClick={(event) => event.stopPropagation()}
                >
                  <span>
                    {reminder.application.company} - {reminder.application.role}
                  </span>

                  <MoveUpRight className={styles.linkIcon} />
                </Link>
              )}

              <span className={isOverdue ? styles.overdueDate : styles.date}>
                {isOverdue ? `Was due ${formattedDate}` : formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={handleComplete}
            disabled={isDismissing || isCompleting}
            className={styles.actionButton}
            variant="ghost"
            size="sm"
          >
            {isCompleting ? (
              "Completing..."
            ) : (
              <span className={styles.actionContent}>
                <Check size={15} aria-hidden="true" />
                <span>Mark as Completed</span>
              </span>
            )}
          </Button>

          <Button
            onClick={handleDismiss}
            disabled={isDismissing || isCompleting}
            className={styles.actionButton}
            variant="ghost"
            size="sm"
          >
            {isDismissing ? (
              "Deleting..."
            ) : (
              <span className={styles.actionContent}>
                <X size={15} aria-hidden="true" />
                <span>Dismiss</span>
              </span>
            )}
          </Button>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
