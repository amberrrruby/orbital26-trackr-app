import ResumeFormSkeleton from "@/app/components/ResumeFormSkeleton";
import { Skeleton } from "@/app/components/Skeleton";
import styles from "./page.module.css";

export default function AddResumeLoading() {
  return (
    <main className={styles.page}>
      <Skeleton className={styles.backLink} />
      <header className={styles.header}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.subtitle} />
      </header>

      <ResumeFormSkeleton />
    </main>
  );
}
