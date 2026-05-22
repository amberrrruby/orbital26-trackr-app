import Link from "next/link";
import styles from "./Settings.module.css";

export default async function SettingsPage() {
  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      <p>
        This should be a wrapped sidebar / navigation bar. All visits to
        `/settings` should be considered to be redirected to `/settings/profile`
        in the future
      </p>

      <section>
        <h2>Account</h2>
        <Link href="/settings/profile">[Edit Profile]</Link>
      </section>

      <section>
        <h2>Security</h2>
        <Link href="/settings/account">[Account Settings]</Link>
      </section>
    </div>
  );
}
