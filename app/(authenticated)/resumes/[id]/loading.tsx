import { Skeleton } from "@/app/components/Skeleton";
import styles from "./ResumeDetails.module.css";

const TAGS = Array.from({ length: 3 });
const APPLICATIONS = Array.from({ length: 4 });
const STATS = Array.from({ length: 4 });

export default function ResumeDetailsLoading() {
  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Skeleton className={styles.backLink} />

        <div className={styles.actions}>
          <Skeleton className={styles.skeletonActionButton} />
          <Skeleton className={styles.skeletonActionButton} />
        </div>
      </div>

      <header className={styles.header}>
        <Skeleton className={styles.skeletonTitle} />

        <div className={styles.tags}>
          {TAGS.map((_, index) => (
            <Skeleton key={index} className={styles.skeletonTag} />
          ))}
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.left}>
          <section className={styles.card}>
            <Skeleton className={styles.skeletonSectionTitle} />

            <div className={styles.skeletonTextGroup}>
              <Skeleton className={styles.skeletonTextLine} />
              <Skeleton className={styles.skeletonTextLine} />
              <Skeleton
                className={`${styles.skeletonTextLine} ${styles.skeletonTextLineShort}`}
              />
            </div>
          </section>

          <section className={styles.card}>
            <Skeleton className={styles.skeletonSectionTitle} />

            <ul className={styles.appList}>
              {APPLICATIONS.map((_, index) => (
                <li key={index}>
                  <div className={styles.appItem}>
                    <div className={styles.applicationDetails}>
                      <Skeleton className={styles.skeletonAppCompany} />
                      <Skeleton className={styles.skeletonAppRole} />
                    </div>

                    <div className={styles.applicationBadge}>
                      <Skeleton className={styles.skeletonBadge} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles.right}>
          <section className={`${styles.card} ${styles.fileCard}`}>
            <Skeleton className={styles.thumbnailWrapper} />

            <div className={styles.fileInformation}>
              <Skeleton className={styles.skeletonFileName} />
              <Skeleton className={styles.skeletonLastUpdated} />
            </div>
          </section>

          <section className={styles.card}>
            <Skeleton className={styles.skeletonSectionTitle} />

            <dl className={styles.statsList}>
              {STATS.map((_, index) => (
                <div key={index} className={styles.statRow}>
                  <Skeleton className={styles.skeletonStatLabel} />
                  <Skeleton className={styles.skeletonStatValue} />
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
