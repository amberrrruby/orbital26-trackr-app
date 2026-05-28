"use client";

import { useState } from "react";
import { createApplication } from "@/app/actions/applications/create-application";
import styles from "./AddApplicationForm.module.css";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA/ Assessment", value: "OA_ASSESSMENT" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AddApplicationForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createApplication(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      {error && <p>{error}</p>}

      <Input label="Company" id="company" name="company" type="text" required />

      <Input label="Role" id="role" name="role" type="role" required />

      <Input label="Source" id="source" name="source" type="text" />

      <div className={styles.field}>
        <label htmlFor="status">Status</label>
        <select id="status" name="status" required defaultValue="APPLIED">
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
      />

      <Textarea label="Notes" id="notes" name="notes" />

      <div className={styles.createButton}>
        <Button type="submit">Create Application</Button>
      </div>
    </form>
  );
}
