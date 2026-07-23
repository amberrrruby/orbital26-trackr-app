import { Skeleton } from "@/app/components/Skeleton";
import styles from "./Kanban.module.css";

const KANBAN_COLUMNS = Array.from({ length: 5 });
const KANBAN_CARDS = Array.from({ length: 2 });
const TOGGLE_CONTROLS = Array.from({ length: 2 });

function KanbanCardSkeleton() {
  return (
    <article className={styles.card}>
      <div className={styles.cardTopRow}>
        <div className={styles.cardLink}>
          <Skeleton className={styles.loadingCardCompany} />
          <Skeleton className={styles.loadingCardRole} />
        </div>

        <Skeleton className={styles.loadingDragHandle} />
      </div>

      <Skeleton className={styles.loadingDateApplied} />
    </article>
  );
}

function KanbanColumnSkeleton({ columnIndex }: { columnIndex: number }) {
  return (
    <section className={`${styles.column} ${styles.loadingColumn}`}>
      <header
        className={`${styles.columnHeader} ${styles.loadingColumnHeader}`}
      >
        <Skeleton className={styles.loadingColumnTitle} />
        <Skeleton className={styles.loadingColumnCount} />
      </header>

      <div className={styles.columnContent}>
        {KANBAN_CARDS.map((_, cardIndex) => (
          <KanbanCardSkeleton key={`column-${columnIndex}-card-${cardIndex}`} />
        ))}
      </div>
    </section>
  );
}

export default function KanbanLoading() {
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <Skeleton className={styles.loadingPageTitle} />
        <Skeleton className={styles.loadingPageSubtitle} />
      </section>

      <hr />
      <section className={styles.addButton}>
        <Skeleton className={styles.loadingAddButton} />
      </section>
      <div className={styles.boardControls}>
        <Skeleton className={styles.loadingSearch} />
        <div className={styles.columnToggles}>
          {TOGGLE_CONTROLS.map((_, index) => (
            <div key={`toggle-${index}`} className={styles.toggleControl}>
              <Skeleton className={styles.loadingCheckbox} />
              <Skeleton className={styles.loadingToggleLabel} />
            </div>
          ))}
        </div>
      </div>

      <section
        className={`${styles.board} ${styles.loadingBoard}`}
        style={
          {
            "--column-count": KANBAN_COLUMNS.length,
          } as React.CSSProperties
        }
        aria-label="Loading application Kanban board"
      >
        {KANBAN_COLUMNS.map((_, columnIndex) => (
          <KanbanColumnSkeleton
            key={`column-${columnIndex}`}
            columnIndex={columnIndex}
          />
        ))}
      </section>
    </main>
  );
}
