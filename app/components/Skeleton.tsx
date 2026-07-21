import styles from "./Skeleton.module.css";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`${styles.skeleton} ${className}`} />;
}
