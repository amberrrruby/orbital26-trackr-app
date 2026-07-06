"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/react";
import { GripHorizontal, GripVertical } from "lucide-react";
import { ApplicationWithDetails } from "@/lib/types";
import styles from "./Kanban.module.css";

type KanbanCardProps = {
  application: ApplicationWithDetails;
};

export default function KanbanCard({ application }: KanbanCardProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: application.id,
    type: "application",
  });

  const formattedDate = application.dateApplied
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(application.dateApplied))
    : null;

  return (
    <article
      ref={ref}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ""}`}
    >
      <div>
        <Link href={`/applications/${application.id}`}>
          <h3>{application.company}</h3>
          <p>{application.role}</p>
        </Link>

        <button
          ref={handleRef}
          type="button"
          className={styles.dragHandle}
          aria-label={`Move ${application.company} ${application.role}`}
        >
          <GripVertical aria-hidden="true" />
        </button>
      </div>

      {formattedDate && <p>Applied {formattedDate}</p>}
    </article>
  );
}
