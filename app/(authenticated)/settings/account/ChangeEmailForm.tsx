"use client";

import { useState } from "react";
import styles from "../Settings.module.css";
import { changeEmail } from "@/app/actions/settings";

export default function ChangeEmailForm() {
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrMsg(null);
    const result = await changeEmail(formData);

    if (!result.ok) {
      const { error } = result;
      if (error.type === "FAILURE") {
        setErrMsg("Something went wrong, please refresh and try again.");
        return;
      }
      setErrMsg(`${error.param}: ${error.message}`);
    }
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      {errMsg && <div>{errMsg}</div>}
      <label>New email</label>
      <input name="email" type="email" />

      <button type="submit">Update email</button>
    </form>
  );
}
