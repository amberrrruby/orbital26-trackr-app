import Link from "next/link";
import { getApplications } from "@/app/actions/applications/get-applications";
import ApplicationsTable from "./ApplicationsTable";
import { Button } from "@/app/components/Button";
import styles from "./page.module.css";

export default async function ApplicationsPage() {
  const applications = await getApplications();

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

      <ApplicationsTable applications={applications} />
    </main>
  );
}
