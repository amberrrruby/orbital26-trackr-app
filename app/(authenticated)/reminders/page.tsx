import { getReminders } from "@/app/actions/reminders";

export default async function RemindersPage() {
  const reminders = await getReminders();
}
