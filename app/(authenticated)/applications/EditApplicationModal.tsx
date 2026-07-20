"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateApplication } from "@/app/actions/applications";
import { Resume } from "@/lib/generated/client";
import { Button } from "@/app/components/Button";
import { Input, Textarea, Select } from "@/app/components/Input";
import { useToast } from "@/app/components/Toast";
import styles from "./EditApplicationModal.module.css";
import { ApplicationWithDetails, SOURCE_OPTIONS } from "@/lib/types";
import ResumeSelector from "./ResumeSelector";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA / Assessment", value: "OA_ASSESSMENT" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
];

export type ImportantDateValues = {
  oaAssessmentDate: string;
  interviewDate: string;
  offerExpiryDate: string;
};

type EditApplicationProps = {
  application: ApplicationWithDetails;
  resumes: Resume[];
  importantDates: ImportantDateValues;
  onClose: () => void;
};

function formatDateForInput(date: Date | string) {
  return new Date(date).toISOString().split("T")[0];
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export default function EditApplicationModal({
  application,
  resumes,
  importantDates,
  onClose,
}: EditApplicationProps) {
  const { toast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { id, company, role, source, status, dateApplied, notes } = application;

  async function handleSubmit(formData: FormData) {
    const result = await updateApplication(formData);
    if (!result.ok) {
      if (result.error.type === "FAILURE") {
        toast({
          title: "Could not update application",
          description: "Something went wrong. Please try again.",
          variant: "danger",
        });
        return;
      }

      if (result.error.type === "VALIDATION") {
        setFieldErrors({
          [result.error.param]: result.error.message,
        });
        return;
      }
    }

    toast({
      title: "Application updated",
      description: "Your changes have been saved successfully.",
      variant: "success",
    });
    onClose();
  }

  return (
    <div>
      <form action={handleSubmit} className={styles.form}>
        <input type="hidden" name="id" value={id} />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Details</h2>

          <div className={styles.twoColumn}>
            <Input
              label="Company"
              id="company"
              name="company"
              type="text"
              defaultValue={company}
              error={fieldErrors.company}
              required
            />

            <Input
              label="Role"
              id="role"
              name="role"
              type="role"
              defaultValue={role}
              error={fieldErrors.role}
              required
            />
          </div>

          <div className={styles.twoColumn}>
            <Select
              label="Source"
              id="source"
              name="source"
              required
              defaultValue={source}
              error={fieldErrors.source}
              options={[
                { label: "Select a source", value: "", disabled: true },
                ...Object.entries(SOURCE_OPTIONS).map(([key, label]) => ({
                  label,
                  value: key,
                })),
              ]}
            />

            <Select
              label="Status"
              id="status"
              name="status"
              required
              defaultValue={status}
              error={fieldErrors.status}
              options={statusOptions}
            />
          </div>

          <ResumeSelector
            resumes={resumes}
            defaultValue={application.resumeId ?? ""}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Important Dates</h2>
          <Input
            label="Date Applied"
            id="dateApplied"
            name="dateApplied"
            type="date"
            defaultValue={dateApplied ? formatDateForInput(dateApplied) : ""}
          />

          <div className={styles.importantDates}>
            <Input
              label="OA/Assessment Date"
              id="oaAssessmentDate"
              name="oaAssessmentDate"
              type="date"
              defaultValue={importantDates.oaAssessmentDate ?? ""}
              error={fieldErrors.oaAssessmentDate}
            />

            <Input
              label="Interview Date"
              id="interviewDate"
              name="interviewDate"
              type="date"
              defaultValue={importantDates.interviewDate ?? ""}
              error={fieldErrors.interviewDate}
            />

            <Input
              label="Offer Expiry Date"
              id="offerExpiryDate"
              name="offerExpiryDate"
              type="date"
              defaultValue={importantDates.offerExpiryDate ?? ""}
              error={fieldErrors.offerExpiryDate}
            />
          </div>
        </section>

        <section className={styles.section}>
          <Textarea
            label="Notes"
            id="notes"
            name="notes"
            defaultValue={notes ?? ""}
            error={fieldErrors.notes}
          />
        </section>

        <div className={styles.buttonRow}>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
