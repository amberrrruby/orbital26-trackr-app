"use client";

import { addResume } from "@/app/actions/resume";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  resume?: Resume; // undefined: creation, otherwise: edit
  onCancel: () => void;
};

export default function ResumeFormComponent({ resume, onCancel }: Props) {
  const isEditing = !!resume;
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMsg(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = isEditing
        ? await updateResume(resume.id, formData)
        : await addResume(formData);
      if (!res.ok) {
        setErrMsg(res.error.message);
        return;
      }
      if (isEditing) {
        onCancel();
      } else {
        router.push(`/resumes/${res.value}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Enter alias / title for resume..."
          required
          maxLength={100}
          defaultValue={resume?.title ?? ""}
        />
      </div>

      <div>
        <label htmlFor="file">
          {isEditing
            ? "Replace file (PDF or DOCX)"
            : "Resume file (PDF or DOCX)"}
        </label>
        {/* replace with file upload component */}
        <input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.docx"
          required={!isEditing}
        />
        {isEditing && <span>Skip to keep current file</span>}
      </div>

      <div>
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="frontend, internship"
          defaultValue={resume?.tags.join(", ") ?? ""}
        />
        <span>Comma-separated</span>
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          placeholder="E.g. what is this resume tailored for?"
          rows={3}
          maxLength={1000}
          defaultValue={resume?.notes ?? ""}
        />
      </div>

      {errMsg && <p>{errMsg}</p>}

      <div>
        {isEditing && (
          <button type="button" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving..."
              : "Uploading..."
            : isEditing
              ? "Save Changes"
              : "Add Resume"}
        </button>
      </div>
    </form>
  );
}
