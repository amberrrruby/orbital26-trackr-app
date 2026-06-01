import { requireUserObjectOrRedirectLogin } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountButton from "../DeleteAccountComponents";
import ChangeEmailForm from "./ChangeEmailForm";
import styles from "../Settings.module.css";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

function getSuccessMessage(success?: string): string | null {
  switch (success) {
    case "password-updated":
      return "Password updated successfully.";
    case "email-updated":
      return "Confirmation email sent to new address.";
    default:
      return null;
  }
}

export default async function AccountSettingsPage({ searchParams }: Props) {
  const user = await requireUserObjectOrRedirectLogin();
  const providers = user.identities?.map((i) => i.provider) ?? [];
  const canChangePassword = providers.includes("email");

  const { success } = await searchParams;

  const successMessage = getSuccessMessage(success);

  return (
    <main className={styles.page}>
      {successMessage && <div className={styles.toast}>{successMessage}</div>}

      <section className={styles.card}>
        <h1>Change Email</h1>
        <ChangeEmailForm />
      </section>

      <section className={styles.card}>
        <h1>Change Password</h1>
        {canChangePassword ? (
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
