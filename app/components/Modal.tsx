"use client";

import * as Dialog from "@radix-ui/react-dialog";
import styles from "./Modal.module.css";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={[styles.content, styles[size]].join(" ")}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerText}>
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              {description && (
                <Dialog.Description className={styles.description}>
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button className={styles.closeButton} aria-label="Close">
                <CloseIcon />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          {children && <div className={styles.body}>{children}</div>}

          {/* Footer */}
          {footer && <div className={styles.footer}>{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Convenience re-export so consumers don't need to import Radix directly
 * for the trigger.
 *
 * Usage:
 *   <Modal.Trigger asChild><Button>Open</Button></Modal.Trigger>
 *
 * Or control open state manually via the `open` + `onOpenChange` props.
 */
Modal.Trigger = Dialog.Trigger;

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 2L12 12M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
