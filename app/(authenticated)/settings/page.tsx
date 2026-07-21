import Link from "next/link";
import styles from "./Settings.module.css";

export default async function SettingsPage() {
  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account preferences and security settings.</p>
      </section>
      <hr />

      <section className={styles.settings}>
        <Link href="/settings/profile" className={styles.settingsCard}>
          <div>
            <h2>Profile</h2>
            <p>Manage your profile information.</p>
          </div>
          <span>›</span>
        </Link>

        <Link href="/settings/account" className={styles.settingsCard}>
          <div>
            <h2>Security</h2>
            <p>Manage your email, password and security settings.</p>
          </div>
          <span>›</span>
        </Link>
      </section>
    </main>
  );
}
