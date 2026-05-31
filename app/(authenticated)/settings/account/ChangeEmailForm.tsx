"use client";

import { useState } from "react";
import styles from "../Settings.module.css";
import { changeEmail } from "@/app/actions/settings";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";

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

      <Input label="New email" name="email" type="email" />
      <Button type="submit" className={styles.action}>
        Update email
      </Button>
    </form>
  );
}
