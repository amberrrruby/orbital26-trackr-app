"use client";

import { useState } from "react";
import { createApplication } from "@/app/actions/applications";
import styles from "./AddApplicationForm.module.css";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import { redirect } from "next/navigation";
import { Resume } from "@/lib/generated/client";
import ResumeSelector from "./ResumeSelector";
import { useFormStatus } from "react-dom";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA / Assessment", value: "OA_ASSESSMENT" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
];

type Props = {
  resumes: Resume[];
};

export default function AddApplicationForm({ resumes }: Props) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createApplication(formData);
    if (!result.ok) {
      if (result.error.type === "FAILURE") {
        setError("Something went wrong. Try again.");
        return;
      }
      if (result.error.type === "VALIDATION") {
        setError(
          `Invalid fields: ${result.error.param}: ${result.error.message}`,
        );
        return;
      }
    }
    redirect(`/applications`);

    // When applications details page are done.
    // redirect(`/applications/${result.value}`);
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

      <ResumeSelector resumes={resumes} defaultValue={""} />

      <Input
        label="Date Applied"
        id="dateApplied"
        name="dateApplied"
        type="date"
      />

      <div className={styles.importantDates}>
        <Input
          label="OA/Assessment Date"
          id="oaAssessmentDate"
          name="oaAssessmentDate"
          type="date"
        />

        <Input
          label="Interview Date"
          id="interviewDate"
          name="interviewDate"
          type="date"
        />

        <Input
          label="Offer Expiry Date"
          id="offerExpiryDate"
          name="offerExpiryDate"
          type="date"
        />
      </div>

      <Textarea label="Notes" id="notes" name="notes" />

      <div className={styles.createButton}>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus(); // useState is useless here

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Application"}
    </Button>
  );
}
