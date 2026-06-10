"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";
import { Application, ReminderType } from "@/lib/generated/client";
import { addReminder } from "@/app/actions/reminders";
import { useRouter } from "next/navigation";

type AddReminderModalProps = {
  applications: Application[];
  onClose: () => void;
};

type FieldErrors = Partial<
  Record<"type" | "remindAt" | "content" | "applicationId", string>
>;

const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: "EVENT", label: "Event" },
  { value: "FOLLOW_UP", label: "Follow up" },
];

export default function AddReminderModal({
  applications,
  onClose,
}: AddReminderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [comboOpen, setComboOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [comboQuery, setComboQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    console.log(formData);
    setFieldErrors({});
    setGenericError(null);

    startTransition(async () => {
      const res = await addReminder(formData);
      if (!res.ok) {
        if (res.error.type === "VALIDATION") {
          setFieldErrors({ [res.error.param]: res.error.message });
        } else {
          setGenericError("Something went wrong. Please try again.");
        }
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-medium">Add reminder</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {genericError && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {genericError}
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Type</label>
            <select
              name="type"
              required
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive"
              aria-invalid={!!fieldErrors.type}
              defaultValue=""
            >
              <option value="" disabled>
                Select type...
              </option>
              {REMINDER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {fieldErrors.type && (
              <p className="text-xs text-destructive">{fieldErrors.type}</p>
            )}
          </div>

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

          {/* Remind at */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Remind at</label>
            <input
              type="date"
              name="remindAt"
              required
              aria-invalid={!!fieldErrors.remindAt}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive"
            />
            {fieldErrors.remindAt && (
              <p className="text-xs text-destructive">{fieldErrors.remindAt}</p>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Note</label>
            <textarea
              name="content"
              required
              rows={3}
              placeholder="e.g. Prepare system design questions"
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
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {isPending ? "Adding..." : "Add reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
