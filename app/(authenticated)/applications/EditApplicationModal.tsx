"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateApplication } from "@/app/actions/applications/update-application";
import { Application } from "@/lib/generated/browser";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import styles from "./EditApplicationModal.module.css";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA/ Assessment", value: "OA_ASSESSMENT" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
];

type EditApplicationProps = {
  application: Application;
  onClose: () => void;
};

function formatDateForInput(date: Date | string) {
  return new Date(date).toISOString().split("T")[0];
}

export default function EditApplicationModal({
  application,
  onClose,
}: EditApplicationProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateApplication(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div>
      <div className={styles.modalHeader}>
        <h2>Edit Application</h2>
        <p>Update the details of your job application below.</p>
      </div>

      <form action={handleSubmit} className={styles.form}>
        {error && <p>{error}</p>}

        <input type="hidden" name="id" value={application.id} />

        <Input
          label="Company"
          id="company"
          name="company"
          type="text"
          defaultValue={application.company}
          required
        />

        <Input
          label="Role"
          id="role"
          name="role"
          type="role"
          defaultValue={application.role}
          required
        />

        <Input
          label="Source"
          id="source"
          name="source"
          type="text"
          defaultValue={application.source ?? ""}
        />

        <div className={styles.field}>
          <label htmlFor="status" className={styles.label}>
            Status
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={application.status}
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date Applied"
          id="dateApplied"
          name="dateApplied"
          type="date"
          defaultValue={formatDateForInput(application.dateApplied)}
        />

        <Textarea label="Notes" id="notes" name="notes" />

        <div className={styles.buttonRow}>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
