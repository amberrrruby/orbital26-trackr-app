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
    <>
      {successMessage && <div className={styles.toast}>{successMessage}</div>}

      <section>
        <h1>Change Email</h1>
        <ChangeEmailForm />

        <h1>Change Password</h1>
        {canChangePassword ? (
          <ChangePasswordForm />
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
    </>
  );
}
