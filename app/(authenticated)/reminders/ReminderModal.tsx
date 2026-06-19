"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Application, ReminderType } from "@/lib/generated/client";
import { addReminder, updateReminder } from "@/app/actions/reminders";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/components/Modal";
import { ReminderWithApplication } from "@/lib/types";

type ReminderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
  reminder?: ReminderWithApplication; // present: edit mode, absent: add mode
};

type FieldErrors = Partial<
  Record<"type" | "remindAt" | "content" | "applicationId", string>
>;

export default function ReminderModal({
  open,
  onOpenChange,
  applications,
  reminder,
}: ReminderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [comboOpen, setComboOpen] = useState(false);
  const [comboQuery, setComboQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(
    reminder?.application ?? null,
  );
  const [reminderType, setReminderType] = useState<ReminderType>(
    reminder?.type ?? "EVENT",
  );
  const comboRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const mode = reminder ? "edit" : "create";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setComboOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredApps = applications.filter((app) =>
    `${app.company} - ${app.role}`
      .toLowerCase()
      .includes(comboQuery.toLowerCase()),
  );

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setGenericError(null);

    if (reminderType === "FOLLOW_UP") {
      const remindAt = formData.get("remindAt") as string;

      const offsetDays = Number(formData.get("offsetDays") ?? 0);

      const [year, month, day] = remindAt.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      date.setDate(date.getDate() + offsetDays);

      const result = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      formData.set("remindAt", result);
    }

    startTransition(async () => {
      const res =
        mode === "create"
          ? await addReminder(formData)
          : await updateReminder(reminder!.id, formData);
      if (!res.ok) {
        if (res.error.type === "VALIDATION") {
          setFieldErrors({ [res.error.param]: res.error.message });
        } else {
          setGenericError("Something went wrong. Please try again.");
        }
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add reminder" : "Edit reminder"}
    >
      {genericError && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {genericError}
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-4">
        {/* Application combobox */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">
            Application{" "}
            <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            type="hidden"
            name="applicationId"
            value={selectedApp?.id ?? ""}
          />
          <div className="relative" ref={comboRef}>
            <button
              type="button"
              onClick={() => setComboOpen((v) => !v)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <span className={selectedApp ? "" : "text-muted-foreground"}>
                {selectedApp
                  ? `${selectedApp.company} - ${selectedApp.role}`
                  : "Search applications..."}
              </span>
              <ChevronsUpDown size={14} className="text-muted-foreground" />
            </button>

            {comboOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-md">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={comboQuery}
                    onChange={(e) => setComboQuery(e.target.value)}
                    className="h-8 w-full rounded-md border border-border bg-muted px-3 text-xs focus:outline-none"
                    autoFocus
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto pb-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(null);
                        setComboOpen(false);
                        setComboQuery("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                    >
                      <span>None</span>
                    </button>
                  </li>
                  {filteredApps.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-muted-foreground">
                      No applications found.
                    </li>
                  ) : (
                    filteredApps.map((app) => (
                      <li key={app.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setComboOpen(false);
                            setComboQuery("");
                          }}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-muted"
                        >
                          <span>
                            {app.company}{" "}
                            <span className="text-muted-foreground">
                              - {app.role}
                            </span>
                          </span>
                          {selectedApp?.id === app.id && (
                            <Check size={12} className="text-primary" />
                          )}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          {fieldErrors.applicationId && (
            <p className="text-xs text-destructive">
              {fieldErrors.applicationId}
            </p>
          )}
        </div>

        {/* TODO: source key field */}
        <input type="hidden" name="source" value="" />

        {/* Remind at */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Remind at</label>

          <div className="flex gap-5">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="reminderType"
                value="EVENT"
                checked={reminderType === "EVENT"}
                onChange={() => setReminderType("EVENT")}
              />
              Event-based
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="reminderType"
                value="FOLLOW_UP"
                checked={reminderType === "FOLLOW_UP"}
                onChange={() => setReminderType("FOLLOW_UP")}
              />
              Follow-up
            </label>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 flex flex-col gap-2.5">
            {reminderType === "EVENT" ? (
              <>
                <span className="text-sm font-medium">
                  Event-based reminder
                </span>
                <div className="flex items-center gap-2.5">
                  <label className="text-sm text-muted-foreground whitespace-nowrap">
                    Reminder date:
                  </label>
                  <input
                    type="date"
                    name="remindAt"
                    required
                    aria-invalid={!!fieldErrors.remindAt}
                    className="h-8 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive"
                    defaultValue={
                      reminder?.remindAt
                        ? new Date(reminder.remindAt)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Follow-up reminder</span>
                <div className="flex items-center gap-2.5">
                  <label className="text-sm text-muted-foreground whitespace-nowrap">
                    Base date:
                  </label>
                  <input
                    type="date"
                    name="remindAt"
                    required
                    className="h-8 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    defaultValue={
                      reminder
                        ? (() => {
                            const date = new Date(reminder.remindAt);
                            date.setDate(date.getDate() - reminder.offsetDays!);

                            return date.toISOString().split("T")[0];
                          })()
                        : ""
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground whitespace-nowrap">
                    Remind me after
                  </label>
                  <input
                    type="number"
                    name="offsetDays"
                    min="1"
                    defaultValue={7}
                    className="h-8 w-16 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </>
            )}
          </div>

          {fieldErrors.remindAt && (
            <p className="text-xs text-destructive">{fieldErrors.remindAt}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Title</label>
          <textarea
            name="content"
            required
            rows={3}
            placeholder="e.g. Prepare problems for interview"
            defaultValue={reminder?.content ?? ""}
            aria-invalid={!!fieldErrors.content}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive"
          />
          {fieldErrors.content && (
            <p className="text-xs text-destructive">{fieldErrors.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {isPending
              ? mode === "create"
                ? "Adding..."
                : "Saving..."
              : mode === "create"
                ? "Add reminder"
                : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
