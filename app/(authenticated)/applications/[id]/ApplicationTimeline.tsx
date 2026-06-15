import { TimelineEventWithApplication } from "@/lib/types";
import styles from "./ApplicationTimeline.module.css";

type ApplicationTimelineProps = {
  timelineEvents: TimelineEventWithApplication[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function ApplicationTimeline({
  timelineEvents,
}: ApplicationTimelineProps) {
  if (timelineEvents.length === 0) {
    return (
      <section>
        <h2>Application Timeline</h2>
        <p className={styles.empty}>No timeline events yet.</p>
      </section>
    );
  }
  return (
    <section>
      <h2>Application Timeline</h2>

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
    </section>
  );
}
