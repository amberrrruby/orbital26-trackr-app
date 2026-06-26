import type { Reminder } from "@/lib/types";
import styles from "./ApplicationReminders.module.css";

type ApplicationReminderProps = {
  reminders: Reminder[];
};

export default function ApplicationReminders({
  reminders,
}: ApplicationReminderProps) {
  const eventReminders = reminders.filter(
    (reminder) => reminder.type === "EVENT",
  );
  const followUpReminders = reminders.filter(
    (reminder) => reminder.type === "FOLLOW_UP",
  );

  return (
    <div>
      <h2 className={styles.header}> Events and Reminders </h2>
      <div className={styles.groups}>
        <ReminderGroup
          title="Events"
          reminders={eventReminders}
          emptyMessage="No event reminders for this application"
        />
        <ReminderGroup
          title="Follow-ups"
          reminders={followUpReminders}
          emptyMessage="No follow-up reminders currently due"
        />
      </div>
    </div>
  );
}

function ReminderGroup({
  title,
  reminders,
  emptyMessage,
}: {
  title: string;
  reminders: Reminder[];
  emptyMessage: string;
}) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>

      {reminders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reminders.map((reminder) => (
            <ReminderRow reminder={reminder} key={reminder.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(reminder.remindAt));

  return (
    <div className={styles.row}>
      <p className={styles.content}>{reminder.content}</p>
      <p className={styles.date}>{formattedDate}</p>
    </div>
  );
}
