"use client";

import { TimelineEventWithApplication } from "@/lib/types";
import styles from "./ApplicationTimeline.module.css";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateManualTimelineEvent,
  deleteTimelineEvent,
} from "@/app/actions/timeline";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { Input, Textarea } from "@/app/components/Input";
import { useToast } from "@/app/components/Toast";
import { Pencil, Trash2 } from "lucide-react";
import AddManualTimelineEventModal from "./AddManualTimelineEventModal";

type ApplicationTimelineProps = {
  applicationId: string;
  timelineEvents: TimelineEventWithApplication[];
};

type FieldErrors = Partial<Record<"eventDate" | "description", string>>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateForInput(date: Date | string) {
  return new Date(date).toISOString().split("T")[0];
}

export default function ApplicationTimeline({
  applicationId,
  timelineEvents,
}: ApplicationTimelineProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const eventToDelete = timelineEvents.find(
    (event) => event.id === deleteEventId,
  );

  function handleUpdate(formData: FormData) {
    formData.set("applicationId", applicationId);
    setFieldErrors({});

    startTransition(async () => {
      const res = await updateManualTimelineEvent(formData);
      if (!res.ok) {
        if (res.error.type === "VALIDATION") {
          setFieldErrors({ [res.error.param]: res.error.message });
        }

        toast({
          title: "Could not update timeline event",
          description: "Something went wrong. Please try again.",
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Timeline event updated",
        description: "Your changes have been saved successfully.",
        variant: "success",
      });

      setEditingEventId(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteEventId) return;

    startTransition(async () => {
      const res = await deleteTimelineEvent(deleteEventId);
      if (!res.ok) {
        toast({
          title: "Could not delete timeline event",
          description: "Something went wrong. Please try again.",
          variant: "danger",
        });
        return;
      }

      setDeleteEventId(null);
      router.refresh();
    });
  }

  return (
    <section>
      <div className={styles.timelineHeader}>
        <h2>Application Timeline</h2>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add manual timeline event
        </Button>
      </div>

      {timelineEvents.length === 0 ? (
        <p className={styles.empty}>No timeline events yet.</p>
      ) : (
        <div className={styles.timeline}>
          {timelineEvents.map((event) => {
            const isManual = event.type === "MANUAL";
            const isEditing = editingEventId === event.id;

            if (isEditing && isManual) {
              return (
                <form
                  key={event.id}
                  action={handleUpdate}
                  className={styles.timelineItem}
                >
                  <input type="hidden" name="id" value={event.id} />

                  <div className={styles.date}>
                    <Input
                      id={`timeline-date-${event.id}`}
                      name="eventDate"
                      type="date"
                      defaultValue={formatDateForInput(event.eventDate)}
                      error={fieldErrors.eventDate}
                      required
                    />
                  </div>

                  <div className={styles.markerColumn}>
                    <div className={styles.marker}></div>
                  </div>

                  <div className={styles.description}>
                    <Textarea
                      id={`timeline-description-${event.id}`}
                      name="description"
                      defaultValue={event.description}
                      error={fieldErrors.description}
                      required
                      rows={2}
                    />

                    <div className={styles.inlineActions}>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingEventId(null)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                      >
                        {isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={event.id}
                className={`${styles.timelineItem} ${styles.editableItem}`}
              >
                <div
                  className={`${styles.date} ${
                    isManual ? styles.clickable : ""
                  }`}
                  onClick={() => {
                    if (isManual) {
                      setEditingEventId(event.id);
                    }
                  }}
                >
                  {formatDate(event.eventDate)}
                </div>

                <div className={styles.markerColumn}>
                  <div className={styles.marker}></div>
                </div>

                <div className={styles.description}>
                  <div
                    className={`${styles.descriptionContent} ${
                      isManual ? styles.clickable : ""
                    }`}
                    onClick={() => {
                      if (isManual) {
                        setEditingEventId(event.id);
                      }
                    }}
                  >
                    <p>{event.description}</p>
                    <div
                      className={styles.eventActions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isManual && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingEventId(event.id)}
                          aria-label="Edit timeline event"
                        >
                          <Pencil size={14}></Pencil>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setDeleteEventId(event.id)}
                        aria-label="Delete timeline event"
                      >
                        <Trash2 size={14}></Trash2>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddManualTimelineEventModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        applicationId={applicationId}
      />

      {eventToDelete && (
        <Modal
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeleteEventId(null);
          }}
          title="Delete timeline event"
          description="This action cannot be undone."
        >
          <p className={styles.deleteMessage}>
            Are you sure you want to delete{" "}
            <strong>{eventToDelete.description}</strong>?
          </p>

          <div className={styles.deleteActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteEventId(null)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
