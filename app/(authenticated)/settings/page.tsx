import { requireUserObjectOrRedirectLogin } from "@/lib/auth";
import DeleteAccountButton from "./DeleteAccountComponents";
import Link from "next/link";
import styles from "./Settings.module.css";

type SettingsPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

function getSuccessMessage(success?: string): string | null {
  switch (success) {
    case "password-updated":
      return "Password updated successfully.";
    default:
      return null;
  }
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const user = await requireUserObjectOrRedirectLogin();
  const { success } = await searchParams;

  const successMessage = getSuccessMessage(success);

  const providers = user.identities?.map((i) => i.provider) ?? [];
  const canChangePassword = providers.includes("email");
  return (
    <div className={styles.container}>
      <h1>Settings</h1>

      {successMessage && <div className={styles.toast}>{successMessage}</div>}

      <section>
        <h2>Account</h2>
        <p>Authenticated as user ID: {user.id}</p>
      </section>

      <section>
        <h2>Security</h2>
        {canChangePassword ? (
          <Link href="/settings/change-password">[Change Password]</Link>
        ) : (
          <p>
            <i>This account does not use a password.</i>
          </p>
        )}
      </section>

      <section>
        <h2>Danger zone</h2>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
