import styles from "./Badge.module.css";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "wishlist"
  | "applied"
  | "assessment"
  | "interview"
  | "offer"
  | "rejected";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
