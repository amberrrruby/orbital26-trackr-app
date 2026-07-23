"use client";

import styles from "../Settings.module.css";
import { changeEmail } from "@/app/actions/settings";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { useToast } from "@/app/components/Toast";

export default function ChangeEmailForm() {
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    const result = await changeEmail(formData);

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
    toast({
      title: "Confirmation email sent to new address.",
      variant: "success",
    });
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      <Input label="New email" name="email" type="email" />
      <Button type="submit" className={styles.action}>
        Update email
      </Button>
    </form>
  );
}
