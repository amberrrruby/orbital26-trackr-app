import Link from "next/link.js";
import AddApplicationForm from "../AddApplicationForm";
import { Button } from "@/app/components/Button";
import styles from "./page.module.css";
import { getResumes } from "@/app/actions/resume";
import { Suspense } from "react";

export default async function NewApplicationPage() {
  const res = await getResumes();
  return (
    <main className={styles.page}>
      <Link href="/applications">
        <Button>Back to Applications</Button>
      </Link>

      <div className={styles.header}>
        <h1>Add Application</h1>
        <p>Fill in the details of a new job application.</p>
      </div>
      <div>
        <Suspense>
          {!res.ok ? (
            <p>
              [TEMP ERROR COMPONENT] Failed to load resumes. Please refresh the
              page and try again.
            </p>
          ) : (
            <AddApplicationForm resumes={res.value.resumes} />
          )}
        </Suspense>
      </div>
    </main>
  );
}
