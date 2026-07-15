"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addManualTimelineEvent } from "@/app/actions/timeline";
import { Modal } from "@/app/components/Modal";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import { useToast } from "@/app/components/Toast";
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
  const router = useRouter();
  const { toast } = useToast();

  if (!open) {
    return null;
  }

  function handleSubmit(formData: FormData) {
    setFieldErrors({});

    formData.set("applicationId", applicationId);

    startTransition(async () => {
      const res = await addManualTimelineEvent(formData);

      if (!res.ok) {
        if (res.error.type === "VALIDATION") {
          setFieldErrors({ [res.error.param]: res.error.message });
          return;
        }
        toast({
          title: "Could not add timeline event",
          description: "Something went wrong. Please try again.",
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Timeline event added",
        description: "The timeline event has been saved successfully.",
        variant: "success",
      });

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
          name="description"
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
