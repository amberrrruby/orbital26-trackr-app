"use client";

import { Resume } from "@/lib/generated/client";
// A better refactor??? Since this is also used in add application modal
import styles from "./EditApplicationModal.module.css";

type Props = {
  resumes: Resume[];
  defaultValue?: string;
};

export default function ResumeSelector({ resumes, defaultValue }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor="resumeId" className={styles.label}>
        Resume
      </label>
      <select id="resumeId" name="resumeId" defaultValue={defaultValue ?? ""}>
        <option value="">None</option>
        {resumes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </select>
    </div>
  );
}
