import { sessionHasEmailLoginMethod } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountButton from "../DeleteAccountComponents";
import ChangeEmailForm from "./ChangeEmailForm";
import styles from "../Settings.module.css";

export default async function AccountSettingsPage() {
  const hasEmailLoginMethod = await sessionHasEmailLoginMethod();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Change Email</h1>
        {hasEmailLoginMethod ? (
          <ChangeEmailForm />
        ) : (
          <p>
            <i>This account does not use an email.</i>
          </p>
        )}
      </section>

      <section className={styles.card}>
        <h1>Change Password</h1>
        {hasEmailLoginMethod ? (
          <ChangePasswordForm />
        ) : (
          <p>
            <i>This account does not use a password.</i>
          </p>
        )}
      </section>

      <section className={styles.card}>
        <h1>Danger Zone</h1>
        <p>Permanently delete your account and related data.</p>
        <div className={styles.action}>
          <DeleteAccountButton />
        </div>
      </section>
    </main>
  );
}
