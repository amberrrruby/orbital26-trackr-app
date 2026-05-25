"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { createContext, useContext, useState, useCallback } from "react";
import styles from "./Toast.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "default" | "success" | "warning" | "danger" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  toast: (options: Omit<ToastItem, "id">) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...options }]);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            className={[styles.toast, styles[t.variant ?? "default"]].join(" ")}
            duration={t.duration ?? 4000}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            <div className={styles.icon}>
              <ToastIcon variant={t.variant ?? "default"} />
            </div>
            <div className={styles.body}>
              <RadixToast.Title className={styles.title}>
                {t.title}
              </RadixToast.Title>
              {t.description && (
                <RadixToast.Description className={styles.description}>
                  {t.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close asChild>
              <button className={styles.close} aria-label="Dismiss">
                <CloseIcon />
              </button>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}

        <RadixToast.Viewport className={styles.viewport} />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case "success":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M4.5 7L6.5 9L9.5 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "warning":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1.5L12.5 11.5H1.5L7 1.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M7 5.5V8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10" r="0.75" fill="currentColor" />
        </svg>
      );
    case "danger":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M5 5L9 9M9 5L5 9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "info":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M7 6.5V10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="7" cy="4.5" r="0.75" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M7 4.5V7.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="7" cy="9.5" r="0.75" fill="currentColor" />
        </svg>
      );
  }
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 2L10 10M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
