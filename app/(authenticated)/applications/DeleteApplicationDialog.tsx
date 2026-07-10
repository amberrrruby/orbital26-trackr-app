"use client";

import { useState } from "react";
import { deleteApplication } from "@/app/actions/applications";
import { Application } from "@/lib/generated/browser";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { useToast } from "@/app/components/Toast";

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
  const { toast } = useToast();

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    const result = await deleteApplication(application.id);
    if (!result.ok) {
      toast({
        title: "Could not delete application",
        description: "Something went wrong. Please try again.",
        variant: "danger",
      });

      setIsDeleting(false);
      return;
    }
    onClose();
  }

  return (
    <Modal
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Delete Application"
      description="This action is irreversible and cannot be undone."
      size="sm"
      footer={
        <>
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
        </>
      }
    >
      <p>
        Are you sure you want to delete your application for{" "}
        <strong>{application.role}</strong> at{" "}
        <strong>{application.company}</strong>?
      </p>
    </Modal>
  );
}
