import { getApplications } from "@/app/actions/applications";
import styles from "./Kanban.module.css";
import KanbanBoard from "./KanbanBoard";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import ErrorDisplay from "@/app/components/ErrorDisplay";

export default async function KanbanPage() {
  const result = await getApplications();

  if (!result.ok) {
    return (
      <main className={styles.page}>
        <ErrorDisplay
          title="Could not load applications"
          message="Something went wrong. Please refresh the page and try again."
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Kanban</h1>
        <p> Track applications across each stage of the pipeline.</p>
      </section>
      <hr />
      <section className={styles.addButton}>
        <Link href="/applications/new">
          <Button type="button"> + Add Applications</Button>
        </Link>
      </section>

      <KanbanBoard initialApplications={result.value} />
    </main>
  );
}
