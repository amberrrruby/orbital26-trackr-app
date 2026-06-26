import { Suspense } from "react";
import ResumeGalleryServer from "./ResumeGalleryServer";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import styles from "./page.module.css";

export default function ResumeGalleryPage() {
  return (
    <main className={styles.page}>
      <Link href="/dashboard">← Back to Dashboard</Link>

      <header className={styles.header}>
        <h1>Resumes</h1>
        <p>Manage and organize your resume versions</p>
      </header>

      <hr />
      <section className={styles.addButton}>
        <Link href="/resumes/new">
          <Button> + Add new resume </Button>
        </Link>
      </section>

      <Suspense>
        <ResumeGalleryServer />
      </Suspense>
    </main>
  );
}
