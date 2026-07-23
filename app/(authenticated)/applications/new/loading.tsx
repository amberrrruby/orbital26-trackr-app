import { Skeleton } from "@/app/components/Skeleton";
import styles from "./loading.module.css";

function FieldSkeleton() {
  return (
    <div className={styles.fieldSkeleton}>
      <Skeleton className={styles.fieldLabel} />
      <Skeleton className={styles.fieldInput} />
    </div>
  );
}

function TextareaSkeleton() {
  return (
    <div className={styles.fieldSkeleton}>
      <Skeleton className={styles.fieldLabel} />
      <Skeleton className={styles.textarea} />
    </div>
  );
}

export default function AddApplicationPageLoading() {
  return (
    <main className={styles.page}>
      <Skeleton className={styles.backLink} />

      <div className={styles.header}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.subtitle} />
      </div>

      <form className={styles.form}>
        <section className={styles.section}>
          <div className={styles.sectionIntro}>
            <Skeleton className={styles.sectionTitle} />
            <Skeleton className={styles.descriptionLine} />
            <Skeleton className={styles.descriptionShort} />
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.twoColumn}>
              <FieldSkeleton />
              <FieldSkeleton />
            </div>

            <div className={styles.twoColumn}>
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <FieldSkeleton />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionIntro}>
            <Skeleton className={styles.sectionTitle} />
            <Skeleton className={styles.descriptionLine} />
            <Skeleton className={styles.descriptionShort} />
          </div>

          <div className={styles.sectionContent}>
            <FieldSkeleton />

            <div className={styles.importantDates}>
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionIntro}>
            <Skeleton className={styles.sectionTitle} />
            <Skeleton className={styles.descriptionLine} />
            <Skeleton className={styles.descriptionShort} />
          </div>

          <div className={styles.sectionContent}>
            <TextareaSkeleton />
          </div>
        </section>

        <div className={styles.createButton}>
          <Skeleton className={styles.submitButton} />
        </div>
      </form>
    </main>
  );
}
