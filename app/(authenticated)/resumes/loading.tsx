import { Skeleton } from "@/app/components/Skeleton";
import styles from "./loading.module.css";

const RESUME_GALLERY = Array.from({ length: 4 });
const SORT_BUTTONS = Array.from({ length: 2 });

function ResumeCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.preview} />
      <div className={styles.details}>
        <Skeleton className={styles.cardTitle} />
        <Skeleton className={styles.metaData} />
      </div>
    </div>
  );
}

export default function ResumesLoading() {
  return (
    <main className={styles.page}>
      <Skeleton className={styles.backLink} />
      <header className={styles.header}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.subtitle} />
      </header>

      <hr />
      <section className={styles.addButton}>
        <Skeleton className={styles.addButtonSkeleton} />
      </section>

      <div className={styles.container}>
        <div className={styles.ordering}>
          {SORT_BUTTONS.map((_, index) => (
            <Skeleton key={`sort-${index}`} className={styles.sortButton} />
          ))}
        </div>

        <div className={styles.gallery}>
          {RESUME_GALLERY.map((_, index) => (
            <ResumeCardSkeleton key={`resume-${index}`} />
          ))}
        </div>
      </div>
    </main>
  );
}
