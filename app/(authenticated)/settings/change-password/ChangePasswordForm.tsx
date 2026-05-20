"use client";

import styles from "../Settings.module.css";
import { changePasswordAction } from "@/app/actions/settings/change-password";
import { useActionState } from "react";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    null,
  );

  return (
    <form action={formAction} className={styles.form}>
      <label>New password</label>
      <input name="password" type="password" />

      <button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update password"}
      </button>

      {state?.ok === false && (
        <p className={styles.error}>{state.error.message}</p>
      )}
    </form>
  ); // explicit `=== false` comparison for type narrowing ("must be the boolean `false`, NOT falsy or anything else")
}
