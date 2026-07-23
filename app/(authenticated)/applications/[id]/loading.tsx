import { Skeleton } from "@/app/components/Skeleton";
import styles from "./loading.module.css";

export default function LoadingApplicationDetails() {
  return (
    <main className={styles.page}>
      <Skeleton className={styles.backLink} />

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <Skeleton className={styles.company} />
          <Skeleton className={styles.role} />
          <Skeleton className={styles.badge} />
        </div>
        <Skeleton className={styles.editButton} />
      </header>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <section className={styles.card}>
            <Skeleton className={styles.sectionTitle} />

            <div className={styles.detailsList}>
              <Skeleton className={styles.detailRow} />
              <Skeleton className={styles.detailRow} />
              <Skeleton className={styles.detailRow} />
              <Skeleton className={styles.detailRow} />
              <Skeleton className={styles.detailRow} />
              <Skeleton className={styles.detailRow} />
            </div>
          </section>

          <section className={styles.remindersSection}>
            <Skeleton className={styles.remindersTitle} />

            <Skeleton className={styles.subHeading} />
            <Skeleton className={styles.reminderCard} />
            <Skeleton className={styles.reminderCard} />

            <Skeleton className={styles.subHeading} />
            <Skeleton className={styles.reminderCard} />
          </section>
        </div>

        <section className={styles.timelineColumn}>
          <div className={styles.timelineHeader}>
            <Skeleton className={styles.sectionTitle} />
            <Skeleton className={styles.timelineButton} />
          </div>

          <div className={styles.timelineList}>
            <Skeleton className={styles.timelineRow} />
            <Skeleton className={styles.timelineRow} />
            <Skeleton className={styles.timelineRow} />
            <Skeleton className={styles.timelineRow} />
            <Skeleton className={styles.timelineRow} />
          </div>
        </section>
      </div>
    </main>
  );
}
