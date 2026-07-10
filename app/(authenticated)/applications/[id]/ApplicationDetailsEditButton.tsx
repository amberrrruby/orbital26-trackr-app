"use client";

import { use, useState } from "react";
import { ApplicationWithDetails, GetResumesError, Result } from "@/lib/types";
import { Resume } from "@/lib/generated/client";
import { Pencil } from "lucide-react";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import ErrorDisplay from "@/app/components/ErrorDisplay";
import EditApplicationModal, {
  ImportantDateValues,
} from "../EditApplicationModal";
import styles from "./page.module.css";

type ApplicationDetailsEditButtonProps = {
  application: ApplicationWithDetails;
  resumePromise: Promise<
    Result<{ resumes: Resume[]; totalCount: number }, GetResumesError>
  >;
  importantDates: ImportantDateValues;
};

export default function ApplicationDetailsEditButton({
  application,
  resumePromise,
  importantDates,
}: ApplicationDetailsEditButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const resumesResult = use(resumePromise);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEditing(true)}
      >
        <span className={styles.editButtonContent}>
          <Pencil size={12} />
          <span>Edit Application</span>
        </span>
      </Button>

      <Modal
        open={isEditing}
        onOpenChange={setIsEditing}
        title="Edit application"
        description="Update the details of your job application below."
      >
        {!resumesResult.ok ? (
          <ErrorDisplay
            title="Failed to load resumes"
            message="Please refresh the page and try again."
          />
        ) : (
          <EditApplicationModal
            application={application}
            resumes={resumesResult.value.resumes}
            importantDates={importantDates}
            onClose={() => setIsEditing(false)}
          />
        )}
      </Modal>
    </>
  );
}
