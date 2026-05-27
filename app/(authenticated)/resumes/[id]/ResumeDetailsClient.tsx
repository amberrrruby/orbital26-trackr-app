import styles from "./ResumeDetails.module.css";
import Link from "next/link";
import Image from "next/image";
import { AggregateStats, deleteResume } from "@/app/actions/resume";
import { Application } from "@/lib/generated/client";
import {
  GetAggregateStatsError,
  GetTopKRecentApplicationsError,
  Result,
} from "@/lib/types";
import { useState, useTransition } from "react";
import { useRouter } from "next/router";
import { Modal } from "@/app/components/Modal";

type Props = {
  resume: Resume;
  statsResult: Result<AggregateStats, GetAggregateStatsError>;
  recentApplicationsResult: Result<
    Application[],
    GetTopKRecentApplicationsError
  >;
  onEdit: (resume: Resume) => void;
};

export default function ResumeDetailsClient({
  resume,
  statsResult,
  recentApplicationsResult,
  onEdit,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteErrMsg, setDeleteErrMsg] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startDeleteTransition(async () => {
      const res = await deleteResume(resume.id);
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
      <button onClick={() => onEdit(resume)}>[Edit]</button>
      <button onClick={() => setShowDeleteModal(true)}>[Delete]</button>
      {deleteErrMsg && <p>{deleteErrMsg}</p>}

      <Modal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Resume"
        description={`Are you sure you want to delete "${resume.title}"? This cannot be undone.`}
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      />
      <div className={styles.topBar}>
        <Link href="/resumes" className={styles.back}>
          [&lt;- Back]
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Left column */}
        <div className={styles.left}>
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

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Notes</h2>
            <p className={styles.notes}>{resume.notes ?? "No notes added."}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            {!recentApplicationsResult.ok ? (
              <p className={styles.empty}>Failed to load applications.</p>
            ) : recentApplicationsResult.value.length === 0 ? (
              <p className={styles.empty}>No applications linked yet.</p>
            ) : (
              <ul className={styles.appList}>
                {recentApplicationsResult.value.map((app) => (
                  <li key={app.id} className={styles.appItem}>
                    <span>
                      {app.company} — {app.role}
                    </span>
                    <span className={styles.statusChip}>{app.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/applications?resumeId=${resume.id}`}
              className={styles.viewAll}
            >
              [View all -&lt;]
            </Link>
          </section>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          <div className={styles.thumbnailWrapper}>
            {resume.thumbnailPath ? (
              <Image
                src={resume.thumbnailPath}
                alt={`Thumbnail for ${resume.title}`}
                className={styles.thumbnail}
              />
            ) : (
              <div className={styles.thumbnailPlaceholder} />
            )}
          </div>

          <p className={styles.lastUpdated}>
            <em>
              Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
            </em>
          </p>

          <a
            href={resume.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fileLink}
          >
            {resume.title}.{resume.fileType.toLowerCase()}
          </a>

          <section className={styles.statsPanel}>
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
