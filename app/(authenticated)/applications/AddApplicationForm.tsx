"use client";

import { useState } from "react";
import { createApplication } from "@/app/actions/applications";
import styles from "./AddApplicationForm.module.css";
import { Button } from "@/app/components/Button";
import { Input, Textarea } from "@/app/components/Input";
import { useToast } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import { Resume } from "@/lib/generated/client";
import ResumeSelector from "./ResumeSelector";
import { useFormStatus } from "react-dom";
import { SOURCE_OPTIONS } from "@/lib/types";

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
  const { toast } = useToast();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setFieldErrors({});

    const result = await createApplication(formData);

    if (!result.ok) {
      if (result.error.type === "FAILURE") {
        toast({
          title: "Could not create application",
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
      title: "Application created",
      description: "The application has been saved successfully.",
      variant: "success",
    });

    router.push("/applications");
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      <Input
        label="Company"
        id="company"
        name="company"
        type="text"
        error={fieldErrors.company}
        required
      />

      <Input
        label="Role"
        id="role"
        name="role"
        type="role"
        error={fieldErrors.role}
        required
      />

      <label htmlFor="source" className={styles.label}>
        Source
      </label>
      {/* There's a weird gap here, I don't know why. I just placed a label here... */}
      <select id="source" name="source" defaultValue="">
        <option value="" disabled>
          Select a source
        </option>
        {Object.entries(SOURCE_OPTIONS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

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
        error={fieldErrors.dateApplied}
      />

      <div className={styles.importantDates}>
        <Input
          label="OA/Assessment Date"
          id="oaAssessmentDate"
          name="oaAssessmentDate"
          type="date"
          error={fieldErrors.oaAssessmentDate}
        />

        <Input
          label="Interview Date"
          id="interviewDate"
          name="interviewDate"
          type="date"
          error={fieldErrors.interviewDate}
        />

        <Input
          label="Offer Expiry Date"
          id="offerExpiryDate"
          name="offerExpiryDate"
          type="date"
          error={fieldErrors.offerExpiryDate}
        />
      </div>

      <Textarea
        label="Notes"
        id="notes"
        name="notes"
        error={fieldErrors.notes}
      />

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
