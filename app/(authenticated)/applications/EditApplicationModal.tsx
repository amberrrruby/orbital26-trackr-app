"use client";

import { useState } from "react";
import { updateApplication } from "@/app/actions/applications";
import { Application } from "@/lib/generated/client";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import styles from "./EditApplicationModal.module.css";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA / Assessment", value: "OA_ASSESSMENT" },
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
  const [error, setError] = useState<string | null>(null);
  const { id, company, role, source, status, dateApplied, notes } = application;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateApplication(formData);
    if (!result.ok) {
      setError("Something went wrong. Try again.");
      return;
    }
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

        <input type="hidden" name="id" value={id} />

        <Input
          label="Company"
          id="company"
          name="company"
          type="text"
          defaultValue={company}
          required
        />

        <Input
          label="Role"
          id="role"
          name="role"
          type="role"
          defaultValue={role}
          required
        />

        <Input
          label="Source"
          id="source"
          name="source"
          type="text"
          defaultValue={source ?? ""}
        />

        <div className={styles.field}>
          <label htmlFor="status" className={styles.label}>
            Status
          </label>
          <select id="status" name="status" required defaultValue={status}>
            {statusOptions.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date Applied"
          id="dateApplied"
          name="dateApplied"
          type="date"
          defaultValue={dateApplied ? formatDateForInput(dateApplied) : ""}
        />

        <Textarea
          label="Notes"
          id="notes"
          name="notes"
          defaultValue={notes ?? ""}
        />

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
