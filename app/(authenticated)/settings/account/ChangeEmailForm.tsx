"use client";

import styles from "../Settings.module.css";
import { changeEmailAction } from "@/app/actions/settings/edit-account";

export default function ChangeEmailForm() {
  return (
    <form action={changeEmailAction} className={styles.form}>
      <label>New email</label>
      <input name="email" type="email" />

      <button type="submit">Update email</button>
    </form>
  );
}
