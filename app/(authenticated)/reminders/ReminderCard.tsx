"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { deleteReminder } from "@/app/actions/reminders";
import { useRouter } from "next/navigation";
import { ReminderWithApplication } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/app/components/Button";

interface ReminderCardProps {
  reminder: ReminderWithApplication;
  variant?: "default" | "overdue";
}

export default function ReminderCard({
  reminder,
  variant = "default",
}: ReminderCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const isOverdue = variant === "overdue";

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(reminder.remindAt));

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    const result = await deleteReminder(reminder.id);
    setIsDeleting(false);
    if (!result.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Bell size={18} className="text-muted-foreground" />
          </div>

          <div>
            <p className="text-sm font-medium">{reminder.content}</p>
            <p
              className={`mt-0.5 text-xs ${
                isOverdue ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {reminder.application &&
                `From ${reminder.application.company} - ${reminder.application.role} | `}
              {isOverdue ? `Was due ${formattedDate}` : formattedDate}
            </p>
          </div>
        </div>

        {reminder.application && (
          <Link href={`/applications/${reminder.applicationId}`}>
            <Button onClick={(e) => e.stopPropagation()}>
              Application Details
            </Button>
          </Link>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`shrink-0 rounded-md border px-3 py-1 text-xs transition-colors hover:bg-muted ${
            isOverdue
              ? "border-destructive/40 text-destructive hover:bg-destructive/10"
              : "border-border text-muted-foreground"
          }`}
        >
          {isDeleting ? "Deleting..." : "Dismiss"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
