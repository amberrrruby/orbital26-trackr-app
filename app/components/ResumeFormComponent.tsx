"use client";

import { createResume, updateResume } from "@/app/actions/resume";
import { Resume } from "@/lib/generated/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileUpload } from "./FileUpload";
import { ACCEPTED_MIME } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Props = {
  userId?: string;

  resume?: Resume; // undefined: creation, otherwise: edit
  signedUrl?: string;
};

export default function ResumeFormComponent({
  userId,
  resume,
  signedUrl,
}: Props) {
  const isEditing = !!resume;
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState(resume?.filePath ?? "");
  const [fileType, setFileType] = useState(resume?.fileType ?? "");

  async function handleSubmit(formData: FormData) {
    setErrMsg(null);

    let resolvedFilePath = resume?.filePath ?? "";
    let resolvedFileType = resume?.fileType ?? "";

    if (pendingFile) {
      const ext = ACCEPTED_MIME[pendingFile.type];
      const path = `files/${userId}/${crypto.randomUUID()}.${ext}`;
      const supabase = createSupabaseBrowserClient();

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, pendingFile, { contentType: pendingFile.type });

      if (uploadError) {
        setErrMsg("File upload failed. Please try again.");
        return;
      }

      if (isEditing && resume.filePath) {
        await supabase.storage.from("resumes").remove([resume.filePath]);
      }

      resolvedFilePath = path;
      resolvedFileType = ext.toLowerCase();
      setFilePath(resolvedFilePath);
      setFileType(resolvedFileType);
    } else if (!isEditing) {
      setErrMsg("Please select a file.");
      return;
    }

    formData.set("filePath", resolvedFilePath);
    formData.set("fileType", resolvedFileType);

    startTransition(async () => {
      const res = isEditing
        ? await updateResume(resume.id, formData)
        : await createResume(formData);
      if (!res.ok) {
        setErrMsg("Something went wrong. Please try again.");
        return;
      }
      router.push(
        isEditing ? `/resumes/${resume.id}` : `/resumes/${res.value}`,
      );
    });
  }

  return (
    <form action={handleSubmit}>
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
          {isEditing && signedUrl && resume?.fileType && (
            <div>
              <span>Current file: {fileType.toUpperCase()}</span>
              <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                View current file
              </a>
            </div>
          )}
        </label>
        <FileUpload
          onFileSelect={(file) => setPendingFile(file)}
          onError={(msg) => setErrMsg(msg)}
          isUploading={isPending}
        />
        <input type="hidden" name="filePath" value={filePath} />
        <input type="hidden" name="fileType" value={fileType} />
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
          <button
            type="button"
            onClick={() => router.push(`/resumes/${resume.id}`)}
            disabled={isPending}
          >
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
