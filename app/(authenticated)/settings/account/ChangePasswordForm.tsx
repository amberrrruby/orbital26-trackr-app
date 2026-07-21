"use client";

import { changePassword } from "@/app/actions/settings";
import styles from "../Settings.module.css";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { useToast } from "@/app/components/Toast";

export default function ChangePasswordForm() {
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    const result = await changePassword(formData);

    if (!result.ok) {
      const { error } = result;
      toast({
        title:
          error.type === "FAILURE" ? "Something went wrong" : "Invalid input",
        description:
          error.type === "FAILURE"
            ? "Please refresh and try again."
            : `${error.param}: ${error.message}`,
        variant: "danger",
      });
    }
    toast({ title: "Password updated successfully.", variant: "success" });
  }

  return (
    <form action={handleSubmit} className={styles.form}>
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
