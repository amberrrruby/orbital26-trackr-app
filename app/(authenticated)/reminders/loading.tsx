import { Skeleton } from "@/app/components/Skeleton";
import styles from "./loading.module.css";

const STAT_CARDS = Array.from({ length: 4 });
const REMINDER_SECTIONS = Array.from({ length: 3 });
const REMINDER_CARDS = Array.from({ length: 2 });

function ReminderCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.mainRow}>
        <div className={styles.reminderInfo}>
          <Skeleton className={styles.iconWrapper} />
          <div className={styles.text}>
            <Skeleton className={styles.contentLine} />

            <div className={styles.metadata}>
              <Skeleton className={styles.applicationLine} />
              <Skeleton className={styles.dateLine} />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Skeleton className={styles.completeButton} />
          <Skeleton className={styles.dismissButton} />
        </div>
      </div>
    </div>
  );
}

export default function RemindersLoading() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.subtitle} />
        <hr />
      </header>

      <section className={styles.addButton}>
        <Skeleton className={styles.addButtonSkeleton} />
      </section>

      <div className={styles.statsRow}>
        {STAT_CARDS.map((_, index) => (
          <div key={`stat-${index}`} className={styles.statCard}>
            <Skeleton className={styles.statLabel} />
            <Skeleton className={styles.statValue} />
          </div>
        ))}
      </div>

      <div className={styles.reminderList}>
        {REMINDER_SECTIONS.map((_, sectionIndex) => (
          <section
            key={`section-${sectionIndex}`}
            className={styles.reminderSection}
          >
            <div className={styles.sectionHeader}>
              <Skeleton className={styles.sectionTitle} />
              <Skeleton className={styles.sectionCount} />
            </div>
            <div className={styles.sectionList}>
              {REMINDER_CARDS.map((_, reminderIndex) => (
                <div
                  key={`reminder-${sectionIndex}-${reminderIndex}`}
                  className={styles.reminderItem}
                >
                  <ReminderCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
