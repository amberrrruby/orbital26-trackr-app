import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Badge } from "@/app/components/Badge";
import { getApplicationById } from "@/app/actions/applications";
import styles from "./page.module.css";

type ApplicationDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const { id } = await params;
  const result = await getApplicationById(id);

  if (!result.ok) {
    return (
      <main className={styles.page}>
        <Link href="/applications">
          <Button>Back to Applications</Button>
        </Link>

        <h1>Application Details</h1>
        <p>Something went wrong while loading this application.</p>
      </main>
    );
  }

  const application = result.value;

  if (!application) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link href="/applications">
        <Button>← Back to Applications</Button>
      </Link>

      <header className={styles.header}>
        <h1>{application.company}</h1>
        <p>{application.role}</p>
        <Badge variant="accent">{application.status}</Badge>
      </header>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <section>
            <h2>Application Details</h2>

            <p>
              <strong>Source: </strong>
              {application.source || "Not provided"}
            </p>

            <p>
              <strong>Date Applied: </strong>
              {application.dateApplied
                ? application.dateApplied.toLocaleDateString()
                : "Not provided"}
            </p>

            <p>
              <strong>Resume Used: </strong>
              {application.resume ? (
                <Link href={`/resumes/${application.resume.id}`}>
                  {application.resume.title}
                </Link>
              ) : (
                "No resume linked"
              )}
            </p>

            <p>
              <strong>Created at: </strong>
              {application.createdAt.toLocaleDateString()}
            </p>

            <p>
              <strong>Last updated: </strong>
              {application.updatedAt.toLocaleDateString()}
            </p>

            <p>
              <strong>Notes: </strong>
              {application.notes || "No notes yet"}
            </p>
          </section>

          <section>
            <h2>Events and Reminders</h2>
            <p>No reminders or events yet.</p>
          </section>
        </div>

        <section className={styles.timelineColumn}>
          <h2>Application Timeline</h2>
          <p>Timeline will be shown here.</p>
        </section>
      </div>
    </main>
  );
}
