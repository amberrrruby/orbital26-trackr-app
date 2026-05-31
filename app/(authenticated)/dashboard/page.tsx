import { requireUserOrRedirectLogin } from "@/lib/auth";
import LogoutButton from "../LogoutButton";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export default async function Dashboard() {
  const userId = await requireUserOrRedirectLogin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error(
      `Invariant error: Authenticated user ID ${userId} does NOT have a User record in the public User DB.`,
    );
  }

  // TODO: add className / identifier (for screen readers?) for LogoutButton div
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1>Dashboard</h1>
        <p>
          Welcome to Trackr! Here&apos;s an overview of your job application.
        </p>
      </section>
      <hr />
      <section className={styles.card}>
        <div>
          <h2>Name</h2>
          {user.name ?? "(no display name)"}
        </div>
        <div>
          <h2>Email</h2>
          {user.email ?? "(no email)"}
        </div>
      </section>

      <div className={styles.logout}>
        <LogoutButton />
      </div>
    </main>
  );
}
