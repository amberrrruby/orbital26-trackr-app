"use client";

import { useState } from "react";
import { deleteApplication } from "@/app/actions/applications";
import { Application } from "@/lib/generated/browser";
import { Button } from "@/app/components/Button";
import styles from "./DeleteApplicationDialog.module.css";

type DeleteApplicationProps = {
  application: Application;
  onClose: () => void;
};

export default function DeleteApplicationDialog({
  application,
  onClose,
}: DeleteApplicationProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    const result = await deleteApplication(application.id);
    if (!result.ok) {
      setError("Something went wrong. Try again.");
      setIsDeleting(false);
      return;
    }
    onClose();
  }

  return (
    <div className={styles.dialog}>
      <h2 className={styles.title}>Delete Application</h2>
      <div className={styles.message}>
        <p>
          Are you sure you want to delete your application for{" "}
          <strong>{application.role}</strong> at{" "}
          <strong>{application.company}</strong>?
        </p>
        <p>This action is irreversible and cannot be undone.</p>
      </div>

      {error && <p>{error}</p>}
      <div className={styles.buttonRow}>
        <Button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          variant="secondary"
          size="md"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          variant="danger"
          size="md"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
