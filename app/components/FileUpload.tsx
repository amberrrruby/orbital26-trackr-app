"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import styles from "./FileUpload.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadedFile = {
  url: string; // signed URL
  type: "pdf" | "docx";
  name: string;
  size: number;
};

type FileUploadProps = {
  bucket: string; // Supabase Storage bucket name
  folder?: string; // optional path prefix inside bucket
  signedUrlExpiry?: number; // seconds, default 3600 (1 hour)
  onUpload?: (file: UploadedFile) => void;
  onError?: (message: string) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_MIME: Record<string, "pdf" | "docx"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const ACCEPTED_EXTENSIONS = ".pdf,.docx";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── Component ────────────────────────────────────────────────────────────────

export function FileUpload({
  bucket,
  folder,
  signedUrlExpiry = 3600,
  onUpload,
  onError,
}: FileUploadProps) {
  const supabase = createSupabaseBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_MIME[file.type])
      return "Only PDF and DOCX files are accepted.";
    if (file.size > MAX_SIZE_BYTES)
      return `File exceeds the ${MAX_SIZE_MB}MB limit.`;
    return null;
  }

  async function upload(file: File) {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const ext = ACCEPTED_MIME[file.type];
      const path = [folder, `${crypto.randomUUID()}.${ext}`]
        .filter(Boolean)
        .join("/");

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, signedUrlExpiry);

      if (signedError || !signedData?.signedUrl)
        throw new Error("Failed to generate signed URL.");

      const result: UploadedFile = {
        url: signedData.signedUrl,
        type: ext,
        name: file.name,
        size: file.size,
      };

      setUploaded(result);
      onUpload?.(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleReset() {
    setUploaded(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── Uploaded state ──────────────────────────────────────────────────────────
  if (uploaded) {
    return (
      <div className={styles.uploaded}>
        <span className={styles.uploadedIcon}>
          <FileIcon type={uploaded.type} />
        </span>
        <div className={styles.uploadedMeta}>
          <span className={styles.uploadedName}>{uploaded.name}</span>
          <span className={styles.uploadedSize}>
            {formatSize(uploaded.size)}
          </span>
        </div>
        <button
          type="button"
          className={styles.removeBtn}
          onClick={handleReset}
          aria-label="Remove file"
        >
          <IconClose />
        </button>
      </div>
    );
  }

  // ── Upload zone ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>
      <div
        className={[
          styles.dropzone,
          dragging ? styles.dragging : "",
          uploading ? styles.uploading : "",
          error ? styles.hasError : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload file"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        {uploading ? (
          <div className={styles.loadingState}>
            <span className={styles.spinner}>
              <SpinnerIcon />
            </span>
            <span className={styles.hint}>Uploading…</span>
          </div>
        ) : (
          <div className={styles.idleState}>
            <span className={styles.uploadIcon}>
              <IconUpload />
            </span>
            <span className={styles.label}>
              {dragging ? "Drop to upload" : "Drag and drop or click to upload"}
            </span>
            <span className={styles.hint}>
              PDF or DOCX — up to {MAX_SIZE_MB}MB
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className={styles.error}>
          <IconAlert /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 14.5V16C3 16.55 3.45 17 4 17H16C16.55 17 17 16.55 17 16V14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon({ type }: { type: "pdf" | "docx" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x="2"
        y="1"
        width="11"
        height="16"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 1V5.5H15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9H10M5 12H8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <text
        x="3"
        y="17.5"
        fontSize="4.5"
        fontWeight="600"
        fill="currentColor"
        fontFamily="var(--font-mono)"
      >
        {type.toUpperCase()}
      </text>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 2L10 10M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6 3.5V6.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={styles.spinnerSvg}
    >
      <circle
        cx="9"
        cy="9"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.2"
      />
      <path
        d="M9 2A7 7 0 0 1 16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
