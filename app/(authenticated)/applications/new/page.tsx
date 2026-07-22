import Link from "next/link";
import AddApplicationForm from "../AddApplicationForm";
import styles from "./page.module.css";
import { getResumes } from "@/app/actions/resume";
import { Suspense } from "react";
import ErrorDisplay from "@/app/components/ErrorDisplay";

export default async function NewApplicationPage() {
  const res = await getResumes();
  return (
    <main className={styles.page}>
      <Link href="/applications">← Back to Applications</Link>

      <div className={styles.header}>
        <h1>Add Application</h1>
        <p>Fill in the details of a new job application.</p>
      </div>
      <div>
        <Suspense>
          {!res.ok ? (
            <ErrorDisplay
              title="Failed to load resumes"
              message="Please refresh the page and try again."
            />
          ) : (
            <AddApplicationForm resumes={res.value.resumes} />
          )}
        </Suspense>
      </div>
    </main>
  );
}
