import { Skeleton } from "./Skeleton";
import styles from "./ResumeFormComponent.module.css";

type ResumeFormSkeletonProps = {
  isEditing?: boolean;
};

export default function ResumeFormSkeleton({
  isEditing = false,
}: ResumeFormSkeletonProps) {
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <Skeleton className={styles.skeletonLabel} />
        <Skeleton className={styles.skeletonInput} />
      </div>

      <div className={styles.field}>
        <Skeleton className={styles.skeletonFileLabel} />
        {isEditing && <Skeleton className={styles.skeletonCurrentFile} />}
        <Skeleton className={styles.skeletonDropzone} />
      </div>

      <div className={styles.field}>
        <Skeleton className={styles.skeletonLabel} />
        <Skeleton className={styles.skeletonInput} />
        <Skeleton className={styles.skeletonHelperText} />
      </div>

      <div className={styles.field}>
        <Skeleton className={styles.skeletonLabel} />
        <Skeleton className={styles.skeletonTextarea} />
      </div>

      <div className={styles.actions}>
        {isEditing && <Skeleton className={styles.skeletonSecondaryAction} />}

        <div className={styles.primaryAction}>
          <Skeleton className={styles.skeletonPrimaryAction} />
        </div>
      </div>
    </div>
  );
}
