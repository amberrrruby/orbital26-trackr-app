import { Skeleton } from "@/app/components/Skeleton";
import styles from "./loading.module.css";

export default function LoadingApplicationsPage() {
  const rows = Array.from({ length: 6 }, (val, idx) => idx);
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.subtitle} />
      </section>

      <hr />

      <section className={styles.addButton}>
        <Skeleton className={styles.addButtonSkeleton} />
      </section>

      <section className={styles.toolbar}>
        <Skeleton className={styles.searchInput} />

        <div className={styles.filterRow}>
          <Skeleton className={styles.filterLabel} />
          <Skeleton className={styles.filterSelect} />
        </div>
      </section>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <Skeleton className={styles.companyHeader} />
          <Skeleton className={styles.roleHeader} />
          <Skeleton className={styles.sourceHeader} />
          <Skeleton className={styles.statusHeader} />
          <Skeleton className={styles.dateHeader} />
          <Skeleton className={styles.dateHeader} />
          <Skeleton className={styles.dateHeader} />
          <Skeleton className={styles.actionsHeader} />
        </div>

        {rows.map((row) => (
          <div className={styles.tableRow} key={row}>
            <Skeleton className={styles.companyCell} />
            <Skeleton className={styles.roleCell} />
            <Skeleton className={styles.sourceCell} />
            <Skeleton className={styles.statusCell} />
            <Skeleton className={styles.dateCell} />
            <Skeleton className={styles.dateCell} />
            <Skeleton className={styles.dateCell} />
            <div className={styles.actionIcons}>
              <Skeleton className={styles.icon} />
              <Skeleton className={styles.icon} />
              <Skeleton className={styles.icon} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <Skeleton className={styles.pageButton} />
        <Skeleton className={styles.pageText} />
        <Skeleton className={styles.pageButton} />
      </div>
    </main>
  );
}
