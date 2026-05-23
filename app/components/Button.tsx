"use client";

import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        loading ? styles.loading : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <SpinnerIcon />
        </span>
      )}
      {!loading && iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {children && <span className={styles.label}>{children}</span>}
      {!loading && iconRight && (
        <span className={styles.icon}>{iconRight}</span>
      )}
    </button>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={styles.spinnerSvg}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
