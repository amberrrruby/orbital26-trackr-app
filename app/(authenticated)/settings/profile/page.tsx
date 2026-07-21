import { requireUserOrRedirectLogin } from "@/lib/auth";
import EditProfileForm from "./EditProfileForm";
import { prisma } from "@/lib/prisma";
import { User as DBUser } from "@/lib/generated/client";
import styles from "../Settings.module.css";
import { ReminderSettingsSchema } from "@/lib/types";

export default async function EditProfilePage() {
  // NOTE: if needed, wrap into `requireAppUser: () => DBUser` if reuses exist
  const userId = await requireUserOrRedirectLogin();
  const userProfile: DBUser | null = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userProfile) {
    // this means: current session user passed auth check (has User record in auth DB, but does NOT have a record in the public User DB.)
    // something wrong with the function triggered on account creation that creates the User record in the public User DB.
    // this is an implementation error, should NOT happen if correctly implemented. Will just throw a raw Error here to signal devs to fix.
    throw new Error(
      `Invariant error: Authenticated user ID ${userId} does NOT have a User record in the public User DB.`,
    );
  }

  // Only place where profile and settings are needed, hence parse here and not a separate call
  const userSettings = ReminderSettingsSchema.safeParse(
    userProfile.settings,
  ).data;

  // Forceful `!` because the internal JSON that's being passed around shouldn't be null, hence causing an issue...
  return (
    <main className={styles.page}>
      <EditProfileForm userProfile={userProfile} userSettings={userSettings!} />
    </main>
  );
}
