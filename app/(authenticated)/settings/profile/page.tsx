import { requireUserOrRedirectLogin } from "@/lib/auth";
import EditProfileForm from "./EditProfileForm";
import { prisma } from "@/lib/prisma";
import { User as DBUser } from "@/lib/generated/client";
import styles from "../Settings.module.css";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

function getSuccessMessage(success?: string): string | null {
  switch (success) {
    case "true":
      return "Profile information edited sucessfully.";
    default:
      return null;
  }
}

export default async function EditProfilePage({ searchParams }: Props) {
  // NOTE: if needed, wrap into `requireAppUser: () => DBUser` if reuses exist
  const userId = await requireUserOrRedirectLogin();
  const userProfile: DBUser | null = await prisma.user.findUnique({
    where: { id: userId },
  });

  const { success } = await searchParams;
  const successMessage = getSuccessMessage(success);

  if (!userProfile) {
    // this means: current session user passed auth check (has User record in auth DB, but does NOT have a record in the public User DB.)
    // something wrong with the function triggered on account creation that creates the User record in the public User DB.
    // this is an implementation error, should NOT happen if correctly implemented. Will just throw a raw Error here to signal devs to fix.
    throw new Error(
      `Invariant error: Authenticated user ID ${userId} does NOT have a User record in the public User DB.`,
    );
  }

  return (
    <>
      {successMessage && <div className={styles.toast}>{successMessage}</div>}
      <EditProfileForm userProfile={userProfile} />
    </>
  );
}
