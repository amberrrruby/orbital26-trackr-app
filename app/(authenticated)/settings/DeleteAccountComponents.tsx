"use client";

import { useState, useActionState, useEffect } from "react";
import { deleteAccount } from "@/app/actions/settings";
import styles from "./Settings.module.css";
import { Button } from "@/app/components/Button";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="danger">
        Delete account
      </Button>

      {open && <DeleteAccountModal onClose={() => setOpen(false)} />}
    </>
  );
}

// For now, no separation should be justified, since only the button above
// can open this modal below
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(deleteAccount, null);

  // Close modal on successful deletion
  useEffect(() => {
    if (state?.ok) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Delete account?</h3>
        <p>This action cannot be undone.</p>

        {state?.ok === false && (
          <p className={styles.error}>
            Something went wrong. Please try again. Your account is not deleted
            yet.
          </p>
        )}

        <form action={action}>
          <Button type="submit" variant="danger" disabled={isPending}>
            {isPending ? "Deleting..." : "Yes, delete my account"}
          </Button>
        </form>

        <Button onClick={onClose} disabled={isPending} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
}
