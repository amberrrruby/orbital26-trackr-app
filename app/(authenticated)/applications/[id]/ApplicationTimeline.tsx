"use client";

import { TimelineEventWithApplication } from "@/lib/types";
import styles from "./ApplicationTimeline.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addManualTimelineEvent,
  updateManualTimelineEvent,
  deleteManualTimelineEvent,
} from "@/app/actions/timeline";
import { Button } from "@/app/components/Button";
import AddManualTimelineEventModal from "./AddManualTimelineEventModal";

type ApplicationTimelineProps = {
  applicationId: string;
  timelineEvents: TimelineEventWithApplication[];
};

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

  return (
    <section>
      <div className={styles.timelineEventHeader}>
        <h2>Application Timeline</h2>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add manual timeline event
        </Button>
      </div>

      {timelineEvents.length === 0 ? (
        <p className={styles.empty}>No timeline events yet.</p>
      ) : (
        <div className={styles.timeline}>
          {timelineEvents.map((event) => (
            <div key={event.id} className={styles.timelineItem}>
              <div className={styles.date}>{formatDate(event.eventDate)}</div>

              <div className={styles.markerColumn}>
                <div className={styles.marker}></div>
              </div>

              <div className={styles.description}>
                <p>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddManualTimelineEventModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        applicationId={applicationId}
      />
    </section>
  );
}
