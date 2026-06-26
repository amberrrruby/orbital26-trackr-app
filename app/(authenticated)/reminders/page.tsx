import { getReminders } from "@/app/actions/reminders";
import RemindersPageClient from "./RemindersPageClient";
import { getApplications } from "@/app/actions/applications";
import styles from "./page.module.css";

const PREVIEW_LIMIT = 5;

export default async function RemindersPage() {
  const todayRemindersResult = await getReminders(0, PREVIEW_LIMIT, "today");
  const upcomingRemindersResult = await getReminders(
    0,
    PREVIEW_LIMIT,
    "upcoming",
  );
  const overdueRemindersResult = await getReminders(
    0,
    PREVIEW_LIMIT,
    "overdue",
  );
  const applicationsResult = await getApplications();

  return (
    <main className={styles.page}>
      <RemindersPageClient
        todayResult={todayRemindersResult}
        upcomingResult={upcomingRemindersResult}
        overdueResult={overdueRemindersResult}
        applicationsResult={applicationsResult}
      />
    </main>
  );
}
