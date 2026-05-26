"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteApplication } from "@/app/actions/applications/delete-application";
import { Application } from "@/lib/generated/browser";

type DeleteApplicationProps = {
  application: Application;
  onClose: () => void;
};

export default function DeleteApplicationDialog({
  application,
  onClose,
}: DeleteApplicationProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    const result = await deleteApplication(application.id);
    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div>
      <h2>Delete Application</h2>
      <p>
        Are you sure you want to delete your application for{" "}
        <strong>{application.role}</strong> at{" "}
        <strong>{application.company}</strong>?
      </p>
      <p>This action is irreversible and cannot be undone.</p>

      {error && <p>{error}</p>}
      <div>
        <button type="button" onClick={onClose} disabled={isDeleting}>
          Cancel
        </button>
        <button type="button" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
