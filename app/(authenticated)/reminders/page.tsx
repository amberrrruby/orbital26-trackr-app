import { getAllGroupReminders, getReminders } from "@/app/actions/reminders";
import RemindersPageClient from "./RemindersPageClient";
import { getApplications } from "@/app/actions/applications";
import styles from "./page.module.css";

// const PREVIEW_LIMIT = 5;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default async function RemindersPage() {
  await wait(3000);

  // const todayRemindersResult = await getReminders(0, PREVIEW_LIMIT, "today");
  const todayRemindersResult = await getAllGroupReminders("today");
  // const upcomingRemindersResult = await getReminders(
  //   0,
  //   PREVIEW_LIMIT,
  //   "upcoming",
  // );
  const upcomingRemindersResult = await getAllGroupReminders("upcoming");
  // const overdueRemindersResult = await getReminders(
  //   0,
  //   PREVIEW_LIMIT,
  //   "overdue",
  // );
  const overdueRemindersResult = await getAllGroupReminders("overdue");
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
