"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Application, ReminderType } from "@/lib/generated/client";
import { addReminder, updateReminder } from "@/app/actions/reminders";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/components/Modal";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import { ReminderWithApplication } from "@/lib/types";
import styles from "./ReminderModal.module.css";

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
    const remindAt = formData.get("remindAt") as string;

    if (reminderType === "FOLLOW_UP") {
      const offsetDays = Number(formData.get("offsetDays") ?? 0);

      const [year, month, day] = remindAt.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      date.setDate(date.getDate() + offsetDays);

      const result = toLocalISOString(date);

      formData.set("remindAt", result);
    } else {
      formData.set("remindAt", toLocalISOString(new Date(remindAt)));
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
      {genericError && <div className={styles.error}>{genericError}</div>}

      <form action={handleSubmit} className={styles.form}>
        {/* Application combobox */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel}>Application</label>
            <span className={styles.optional}>(Optional)</span>
          </div>
          <Input
            type="hidden"
            name="applicationId"
            value={selectedApp?.id ?? ""}
          />
          <div className={styles.combobox} ref={comboRef}>
            <button
              type="button"
              onClick={() => setComboOpen((v) => !v)}
              className={styles.comboboxTrigger}
            >
              <span
                className={
                  selectedApp ? styles.selectedApplication : styles.placeholder
                }
              >
                {selectedApp
                  ? `${selectedApp.company} - ${selectedApp.role}`
                  : "Search applications..."}
              </span>
              <ChevronsUpDown size={14} className={styles.comboboxIcon} />
            </button>

            {comboOpen && (
              <div className={styles.comboboxDropdown}>
                <div className={styles.searchWrapper}>
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={comboQuery}
                    onChange={(e) => setComboQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <ul className={styles.optionList}>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(null);
                        setComboOpen(false);
                        setComboQuery("");
                      }}
                      className={styles.option}
                    >
                      <span>None</span>
                    </button>
                  </li>

                  {filteredApps.length === 0 ? (
                    <li className={styles.noResults}>No applications found.</li>
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
                          className={styles.option}
                        >
                          <span className={styles.optionText}>
                            <span>{app.company}</span>
                            <span className={styles.optionRole}>
                              {app.role}
                            </span>
                          </span>
                          {selectedApp?.id === app.id && (
                            <Check size={12} className={styles.checkIcon} />
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
            <p className={styles.fieldError}>{fieldErrors.applicationId}</p>
          )}
        </div>

        {/* TODO: source key field */}
        <input type="hidden" name="source" value="" />

        {/* Remind at */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Reminder type:</label>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="reminderType"
                value="EVENT"
                checked={reminderType === "EVENT"}
                onChange={() => setReminderType("EVENT")}
              />
              Event-based
            </label>
            <label className={styles.radioLabel}>
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

          <div className={styles.reminderTiming}>
            {reminderType === "EVENT" ? (
              <>
                <div className={styles.timingHeader}>
                  <span className={styles.timingTitle}>
                    Event-based reminder
                  </span>
                  <span className={styles.timingDescription}>
                    Choose the date when this reminder should appear.
                  </span>
                </div>

                <div className={styles.inlineField}>
                  <label className={styles.inlineLabel}>Reminder date:</label>
                  <Input
                    type="date"
                    name="remindAt"
                    required
                    aria-invalid={!!fieldErrors.remindAt}
                    className={styles.dateInput}
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
                <div className={styles.timingHeader}>
                  <span className={styles.timingTitle}>Follow-up reminder</span>
                  <span className={styles.timingDescription}>
                    Choose a base date and how many days later to be reminded.
                  </span>
                </div>
                <div className={styles.inlineField}>
                  <label className={styles.inlineLabel}>Base date:</label>
                  <Input
                    type="date"
                    name="remindAt"
                    required
                    className={styles.dateInput}
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
                <div className={styles.inlineField}>
                  <label className={styles.inlineLabel}>Remind me after</label>
                  <Input
                    type="number"
                    name="offsetDays"
                    min="1"
                    defaultValue={7}
                    className={styles.numberInput}
                  />
                  <span className={styles.inputSuffix}>days</span>
                </div>
              </>
            )}
          </div>

          {fieldErrors.remindAt && (
            <p className={styles.fieldError}>{fieldErrors.remindAt}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <Textarea
            label="Title"
            name="content"
            required
            rows={3}
            placeholder="e.g. Prepare problems for interview"
            defaultValue={reminder?.content ?? ""}
            aria-invalid={!!fieldErrors.content}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive"
          />
          {fieldErrors.content && (
            <p className={styles.fieldError}>{fieldErrors.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending
              ? mode === "create"
                ? "Adding..."
                : "Saving..."
              : mode === "create"
                ? "Add reminder"
                : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const offsetMinutes = date.getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetStr = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    offsetStr
  );
}
