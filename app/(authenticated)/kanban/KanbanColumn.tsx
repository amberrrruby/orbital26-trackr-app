"use client";

import { useDroppable } from "@dnd-kit/react";
import { ApplicationWithDetails, Status } from "@/lib/types";
import KanbanCard from "./KanbanCard";
import styles from "./Kanban.module.css";

const columnClassNames: Record<Status, string> = {
  [Status.WISHLIST]: styles.wishlist,
  [Status.APPLIED]: styles.applied,
  [Status.OA_ASSESSMENT]: styles.assessment,
  [Status.INTERVIEW]: styles.interview,
  [Status.OFFER]: styles.offer,
  [Status.REJECTED]: styles.rejected,
};

type KanbanColumnProps = {
  status: Status;
  label: string;
  applications: ApplicationWithDetails[];
};
export default function KanbanColumn({
  status,
  label,
  applications,
}: KanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
    accept: "application",
  });

  return (
    <section
      ref={ref}
      className={`${styles.column} ${columnClassNames[status]} ${
        isDropTarget ? styles.columnDropTarget : ""
      }`}
      aria-labelledby={`kanban-column-${status}`}
    >
      <header className={styles.columnHeader}>
        <h2 id={`kanban-column-${status}`}>{label}</h2>
        <span
          className={styles.columnCount}
          aria-label={`${applications.length} applications`}
        >
          {applications.length}
        </span>
      </header>

      <div className={styles.columnContent}>
        {applications.length === 0 ? (
          <p className={styles.emptyColumn}>Drop an application here</p>
        ) : (
          applications.map((application) => (
            <KanbanCard key={application.id} application={application} />
          ))
        )}
      </div>
    </section>
  );
}
