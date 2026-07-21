"use client";

import { createResume, updateResume } from "@/app/actions/resume";
import { Resume } from "@/lib/generated/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileUpload } from "./FileUpload";
import { ACCEPTED_MIME } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Input, Textarea } from "./Input";
import { Button } from "./Button";
import { useToast } from "./Toast";
import styles from "./ResumeFormComponent.module.css";

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
  const { toast } = useToast();
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
        toast({
          title: "File upload failed",
          description: "Something went wrong. Please try again.",
          variant: "danger",
        });
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
        toast({
          title: "Could not update resume details",
          description: "Something went wrong. Please try again.",
          variant: "danger",
        });
        return;
      }
      router.push(
        isEditing ? `/resumes/${resume.id}` : `/resumes/${res.value}`,
      );
    });
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      <div>
        <Input
          label="Title"
          id="title"
          name="title"
          type="text"
          placeholder="Enter alias / title for resume..."
          required
          maxLength={100}
          defaultValue={resume?.title ?? ""}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="file">
          {isEditing
            ? "Replace file (PDF or DOCX)"
            : "Resume file (PDF or DOCX) *"}
          {/* ugly patchy solution for "required" visual indicator */}
        </label>

        {isEditing && signedUrl && resume?.fileType && (
          <div className={styles.currentFile}>
            <span>
              <strong>Current file:</strong> {fileType.toUpperCase()}
            </span>
            <a href={signedUrl} target="_blank" rel="noopener noreferrer">
              View current file
            </a>
          </div>
        )}

        <FileUpload
          onFileSelect={(file) => setPendingFile(file)}
          onError={(msg) => setErrMsg(msg)}
          isUploading={isPending}
        />
        <input type="hidden" name="filePath" value={filePath} />
        <input type="hidden" name="fileType" value={fileType} />
      </div>

      <div className={styles.field}>
        <Input
          label="Tags"
          id="tags"
          name="tags"
          type="text"
          placeholder="frontend, internship"
          defaultValue={resume?.tags.join(", ") ?? ""}
        />
        <span className={styles.helperText}>
          Separate multiple tags with commas
        </span>
      </div>

      <div>
        <Textarea
          label="Notes"
          id="notes"
          name="notes"
          placeholder="E.g. what is this resume tailored for?"
          rows={3}
          maxLength={1000}
          defaultValue={resume?.notes ?? ""}
        />
      </div>

      {errMsg && <p>{errMsg}</p>}

      <div className={styles.actions}>
        {isEditing && (
          <Button
            variant="secondary"
            type="button"
            onClick={() => router.push(`/resumes/${resume.id}`)}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <div className={styles.primaryAction}>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? "Saving..."
                : "Uploading..."
              : isEditing
                ? "Save Changes"
                : "Add Resume"}
          </Button>
        </div>
      </div>
    </form>
  );
}
