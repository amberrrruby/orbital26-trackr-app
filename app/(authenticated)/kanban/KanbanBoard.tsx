"use client";

import { useMemo, useState } from "react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { ApplicationWithDetails, Status } from "@/lib/types";
import { updateApplicationStatus } from "@/app/actions/applications";
import KanbanColumn from "./KanbanColumn";
import { useToast } from "@/app/components/Toast";
import { Input } from "@/app/components/Input";
import { Search } from "lucide-react";
import styles from "./Kanban.module.css";

const KANBAN_COLUMNS = [
  {
    status: Status.APPLIED,
    label: "Applied",
  },
  {
    status: Status.OA_ASSESSMENT,
    label: "OA/ Assessment",
  },
  {
    status: Status.INTERVIEW,
    label: "Interview",
  },
  {
    status: Status.OFFER,
    label: "Offer",
  },
  {
    status: Status.REJECTED,
    label: "Rejected",
  },
] as const;

type KanbanBoardProps = {
  initialApplications: ApplicationWithDetails[];
};

export default function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState(
    initialApplications.filter(
      (application) => application.status !== Status.WISHLIST,
    ),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return applications;
    }

    return applications.filter((application) => {
      const company = application.company.toLowerCase();
      const role = application.role.toLowerCase();

      return (
        company.includes(normalizedQuery) || role.includes(normalizedQuery)
      );
    });
  }, [applications, searchQuery]);

  async function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      return;
    }

    const source = event.operation.source;
    const target = event.operation.target;

    if (!source || !target) {
      return;
    }

    const applicationId = String(source.id);
    const destinationStatus = String(target.id) as Status;

    const isValidColumn = KANBAN_COLUMNS.some(
      (column) => column.status === destinationStatus,
    );

    if (!isValidColumn) {
      return;
    }

    const application = applications.find((item) => item.id === applicationId);

    if (!application || application.status === destinationStatus) {
      return;
    }

    const previousApplications = applications;

    setApplications((currentApplications) =>
      currentApplications.map((item) =>
        item.id === applicationId
          ? {
              ...item,
              status: destinationStatus,
            }
          : item,
      ),
    );

    const result = await updateApplicationStatus(
      applicationId,
      destinationStatus,
    );

    if (!result.ok) {
      // Restore the previous state if the database update fails
      setApplications(previousApplications);

      toast({
        title: "Status update failed",
        description:
          "The application was moved back to its previous status. Please try again.",
        variant: "danger",
      });
      return;
    }
  }

  return (
    <>
      <div className={styles.search}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <Input
          type="search"
          value={searchQuery}
          placeholder="Search company or role"
          aria-label="Search Kanban applications"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <section className={styles.board} aria-label="Application Kanban board">
          {KANBAN_COLUMNS.map((column) => {
            const columnApplications = filteredApplications.filter(
              (application) => application.status === column.status,
            );

            return (
              <KanbanColumn
                key={column.status}
                status={column.status}
                label={column.label}
                applications={columnApplications}
              />
            );
          })}
        </section>
      </DragDropProvider>
    </>
  );
}
