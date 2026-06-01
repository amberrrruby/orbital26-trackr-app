"use client";

import { changePassword } from "@/app/actions/settings";
import styles from "../Settings.module.css";
import { useState } from "react";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";

export default function ChangePasswordForm() {
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrMsg(null);
    const result = await changePassword(formData);

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

      <Input
        label="New password"
        name="password"
        type="password"
        required
        minLength={8}
      />

      <Input
        label="Confirm password"
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

      <Button type="submit" className={styles.action}>
        Update password
      </Button>
    </form>
  );
}
