import { getReminders } from "@/app/actions/reminders";
import RemindersPageClient from "./RemindersPageClient";
import { getApplications } from "@/app/actions/applications";

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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <RemindersPageClient
        todayResult={todayRemindersResult}
        upcomingResult={upcomingRemindersResult}
        overdueResult={overdueRemindersResult}
        applicationsResult={applicationsResult}
      />
    </main>
  );
}
