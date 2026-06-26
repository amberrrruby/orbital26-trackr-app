"use client";

import styles from "./ResumeDetails.module.css";
import Link from "next/link";
import { deleteResume } from "@/app/actions/resume";
import { Application, Resume } from "@/lib/generated/client";
import {
  AggregateStats,
  GetAggregateStatsError,
  GetTopKRecentApplicationsError,
  Result,
} from "@/lib/types";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { Badge } from "@/app/components/Badge";

type Props = {
  resume: Resume;
  signedUrl: string | undefined;
  statsResult: Result<AggregateStats, GetAggregateStatsError>;
  recentApplicationsResult: Result<
    Application[],
    GetTopKRecentApplicationsError
  >;
};

export default function ResumeDetailsClient({
  resume,
  signedUrl,
  statsResult,
  recentApplicationsResult,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteErrMsg, setDeleteErrMsg] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startDeleteTransition(async () => {
      const res = await deleteResume(resume.id, resume.filePath);
      if (!res.ok) {
        setDeleteErrMsg("Failed to delete resume.");
        setShowDeleteModal(false);
        return;
      }
      router.push("/resumes");
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/resumes" className={styles.back}>
          ← Back
        </Link>

        <div className={styles.actions}>
          <Link href={`/resumes/${resume.id}/edit`}>
            <Button variant="outline">
              <div className={styles.actionButton}>
                <Pencil className={styles.actionIcon} />
                <p>Edit</p>
              </div>
            </Button>
          </Link>

          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <div className={styles.actionButton}>
              <Trash2 className={styles.actionIcon} />
              <p>Delete</p>
            </div>
          </Button>
        </div>
      </div>

      {deleteErrMsg && <p className={styles.errorMessage}>{deleteErrMsg}</p>}

      <Modal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Resume"
        description={`Are you sure you want to delete "${resume.title}"? This cannot be undone.`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      />

      <header>
        <h1 className={styles.title}>{resume.title}</h1>
        {resume.tags.length > 0 && (
          <div className={styles.tags}>
            {resume.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className={styles.layout}>
        {/* Left column */}
        <div className={styles.left}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Notes</h2>
            <p className={styles.notes}>
              {resume.notes?.trim() || "No notes added."}
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            {!recentApplicationsResult.ok ? (
              <p className={styles.empty}>Failed to load applications.</p>
            ) : recentApplicationsResult.value.length === 0 ? (
              <p className={styles.empty}>No applications linked yet.</p>
            ) : (
              <ul className={styles.appList}>
                {recentApplicationsResult.value.map((app) => (
                  <li key={app.id} className={styles.appItem}>
                    <div className={styles.applicationDetails}>
                      <span className={styles.applicationCompany}>
                        {app.company}
                      </span>

                      <span className={styles.applicationRole}>{app.role}</span>
                    </div>

                    <Badge variant="accent">{app.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
            {/* <Link
              href={`/applications?resumeId=${resume.id}`}
              className={styles.viewAll}
            >
              [View all -&lt;]
            </Link> */}
          </section>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          <section className={`${styles.card} ${styles.fileCard}`}>
            <div className={styles.thumbnailWrapper}>
              {/* {resume.thumbnailPath ? (
                <Image
                  src={resume.thumbnailPath}
                  alt={`Thumbnail for ${resume.title}`}
                  className={styles.thumbnail}
                />
                ) : (
                <div className={styles.thumbnailPlaceholder} />
              )} */}
              <div className={styles.thumbnailPlaceholder}>
                <FileText className={styles.fileIcon} />
                <span>{resume.fileType.toUpperCase()}</span>
              </div>
            </div>

            <div className={styles.fileInformation}>
              {signedUrl ? (
                <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                  {resume.title}.{resume.fileType.toLowerCase()}
                </a>
              ) : (
                <p>
                  Failed to generate signed URL. Please refresh and try again.
                </p>
              )}

              <p className={styles.lastUpdated}>
                <em>
                  Last updated:{" "}
                  {new Date(resume.updatedAt).toLocaleDateString()}
                </em>
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Stats</h2>
            {!statsResult.ok ? (
              <p className={styles.empty}>Failed to load stats.</p>
            ) : statsResult.value.TOTAL === 0 ? (
              <p className={styles.empty}>No applications linked yet.</p>
            ) : (
              <dl className={styles.statsList}>
                <div className={styles.statRow}>
                  <dt>Applied</dt>
                  <dd>{statsResult.value.APPLIED}</dd>
                </div>
                <div className={styles.statRow}>
                  <dt>Interview</dt>
                  <dd>{statsResult.value.INTERVIEW}</dd>
                </div>
                <div className={styles.statRow}>
                  <dt>Offer</dt>
                  <dd>{statsResult.value.OFFER}</dd>
                </div>
                <div className={styles.statRow}>
                  <dt>Success</dt>
                  <dd>
                    {(
                      (statsResult.value.OFFER / statsResult.value.TOTAL) *
                      100
                    ).toFixed(1)}
                    %
                  </dd>
                </div>
              </dl>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
