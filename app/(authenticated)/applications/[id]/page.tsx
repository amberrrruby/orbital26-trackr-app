import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/app/components/Badge";
import { Button } from "@/app/components/Button";
import { getApplicationById } from "@/app/actions/applications";
import { getTimelineEvents } from "@/app/actions/timeline";
import { getRemindersByApplicationId } from "@/app/actions/reminders";
import { getResumes } from "@/app/actions/resume";
import { getImportantDateValues } from "../importantDatesUtils";
import ApplicationTimeline from "./ApplicationTimeline";
import ApplicationReminders from "./ApplicationReminders";
import ApplicationDetailsEditButton from "./ApplicationDetailsEditButton";
import styles from "./page.module.css";
import { SOURCE_OPTIONS } from "@/lib/types";

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
        <Link href="/applications">Back to Applications</Link>

        <h1>Application Details</h1>
        <p>Something went wrong while loading this application.</p>
      </main>
    );
  }

  const application = result.value;

  if (!application) {
    notFound();
  }

  const resumePromise = getResumes();

  const [reminderResult, timelineResult] = await Promise.all([
    getRemindersByApplicationId(application.id),
    getTimelineEvents(application.id),
  ]);

  const importantDates = timelineResult.ok
    ? getImportantDateValues(timelineResult.value)
    : {
        oaAssessmentDate: "",
        interviewDate: "",
        offerExpiryDate: "",
      };

  return (
    <main className={styles.page}>
      <Link href="/applications">← Back to Applications</Link>

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1>{application.company}</h1>
          <p>{application.role}</p>

          <div className={styles.statusBadge}>
            <Badge variant="accent">{application.status}</Badge>
          </div>
        </div>

        <Suspense
          fallback={
            <Button type="button" variant="outline" disabled>
              Loading...
            </Button>
          }
        >
          <ApplicationDetailsEditButton
            application={application}
            resumePromise={resumePromise}
            importantDates={importantDates}
          />
        </Suspense>
      </header>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <section className={styles.card}>
            <h2>Application Details</h2>

            <div className={styles.detailsList}>
              <div className={styles.detailsRow}>
                <span className={styles.detailLabel}>Source: </span>
                <span className={styles.detailValue}>
                  {SOURCE_OPTIONS[application.source]}
                </span>
              </div>

              <div className={styles.detailsRow}>
                <span className={styles.detailLabel}>Date Applied: </span>
                <span className={styles.detailValue}>
                  {application.dateApplied
                    ? application.dateApplied.toLocaleDateString()
                    : "Not provided"}
                </span>
              </div>

              <div className={styles.detailsRow}>
                <span className={styles.detailLabel}>Resume Used: </span>
                <span className={styles.detailValue}>
                  {application.resume ? (
                    <Link href={`/resumes/${application.resume.id}`}>
                      {application.resume.title}
                    </Link>
                  ) : (
                    "No resume linked"
                  )}
                </span>
              </div>

              <div className={styles.detailsRow}>
                <span className={styles.detailLabel}>Created at: </span>
                <span className={styles.detailValue}>
                  {application.createdAt.toLocaleDateString()}
                </span>
              </div>

              <div className={styles.detailsRow}>
                <span className={styles.detailLabel}>Last updated: </span>
                <span className={styles.detailValue}>
                  {application.updatedAt.toLocaleDateString()}
                </span>
              </div>

              <div className={styles.detailsRow}>
                <span className={styles.detailLabel}>Notes: </span>
                <span className={styles.notesValue}>
                  {application.notes || "No notes yet"}
                </span>
              </div>
            </div>
          </section>

          <section>
            {reminderResult.ok ? (
              <ApplicationReminders reminders={reminderResult.value} />
            ) : (
              <>
                <h2>Events and Reminders</h2>
                <p>Failed to load events and reminders.</p>
              </>
            )}
          </section>
        </div>

        <section className={styles.timelineColumn}>
          {timelineResult.ok ? (
            <ApplicationTimeline
              applicationId={application.id}
              timelineEvents={timelineResult.value}
            />
          ) : (
            <>
              <h2>Application Timeline</h2>
              <p>Failed to load application timeline events.</p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
