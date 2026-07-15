import { AlertTriangle } from "lucide-react";
import styles from "./ErrorDisplay.module.css";

type Props = {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
};

export default function ErrorDisplay({
  title = "Something went wrong",
  message = "Please try again.",
  icon = <AlertTriangle size={18} />,
}: Props) {
  return (
    <div className={styles.errorDisplay}>
      <div className={styles.icon}>{icon}</div>

      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
