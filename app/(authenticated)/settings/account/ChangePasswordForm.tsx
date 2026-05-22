"use client";

import { changePasswordAction } from "@/app/actions/settings/edit-account";
import styles from "../Settings.module.css";

export default function ChangePasswordForm() {
  return (
    <form action={changePasswordAction} className={styles.form}>
      <label>New password</label>

      <input name="password" type="password" required minLength={8} />

      <label>Confirm password</label>

      <input
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        onInput={(e) => {
          const form = e.currentTarget.form;
          if (!form) {
            return;
          }

          const passwordInput = form.elements.namedItem(
            "password",
          ) as HTMLInputElement;

          if (e.currentTarget.value !== passwordInput.value) {
            e.currentTarget.setCustomValidity("Passwords do not match");
          } else {
            e.currentTarget.setCustomValidity("");
          }
        }}
      />

      <button type="submit">Update password</button>
    </form>
  );
}
