import Link from "next/link";
import { Suspense } from "react";
import { getApplications } from "@/app/actions/applications";
import ApplicationsTable from "./ApplicationsTable";
import { Button } from "@/app/components/Button";
import styles from "./page.module.css";
import { getResumes } from "@/app/actions/resume";

export default async function ApplicationsPage() {
  const result = await getApplications();
  const resumesResult = await getResumes();

  // TODO: replace with proper error component
  if (!result.ok) {
    return (
      <p>
        [TEMPORARY ERROR COMPONENT] Something went wrong - refresh the page or
        try again.
      </p>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Applications</h1>
        <p> Track and manage your applications.</p>
      </section>
      <hr />
      <section className={styles.addButton}>
        <Link href="/applications/new">
          <Button type="button"> + Add Applications</Button>
        </Link>
      </section>

      <Suspense fallback={<p>Loading applications...</p>}>
        <ApplicationsTable
          applications={result.value}
          resumesResult={resumesResult}
        />
      </Suspense>
    </main>
  );
}
