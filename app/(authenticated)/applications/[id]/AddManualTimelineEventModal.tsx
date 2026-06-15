"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addManualTimelineEvent } from "@/app/actions/timeline";
import { Modal } from "@/app/components/Modal";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import styles from "./AddManualTimelineEventModal.module.css";

type AddManualTimelineEventProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
};

type FieldErrors = Partial<Record<"eventDate" | "description", string>>;

export default function AddManualTimelineEventModal({
  open,
  onOpenChange,
  applicationId,
}: AddManualTimelineEventProps) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return null;
  }

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setGenericError(null);

    formData.set("applicationId", applicationId);

    startTransition(async () => {
      const res = await addManualTimelineEvent(formData);

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
      title="Add manual timeline event"
      description="Record a custom event in this application's timeline."
    >
      {genericError && <p>{genericError}</p>}

      <form action={handleSubmit} className={styles.form}>
        <Input
          label="Date"
          id="manualTimelineEventDate"
          name="eventDate"
          type="date"
          required
          error={fieldErrors.eventDate}
        />

        <Textarea
          label="Description"
          id="manualTimelineDescription"
          required
          rows={4}
          placeholder="e.g. Prepared documents for interview"
          error={fieldErrors.description}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Adding..." : "Add event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
