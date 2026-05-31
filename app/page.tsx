import Link from "next/link";
import { Button } from "@/app/components/Button";
import Image from "next/image";
import styles from "./page.module.css";

export default async function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <Image
          src="/trackr-logo.png"
          alt="Trackr logo"
          width={100}
          height={100}
        />
        <div className={styles.brandText}>
          <h1 className={styles.appName}>Trackr</h1>
          <p className={styles.tagLine}>Apply. Track. Get Hired.</p>
        </div>
      </div>

      <div className={styles.desc}>
        A simple job application tracker that helps you organize opportunities,
        track progress and stay on top of your job search.
      </div>

      <div className={styles.actions}>
        <Link href="/login">
          <Button type="button" variant="primary" size="lg">
            Log In
          </Button>
        </Link>

        <Link href="/palette">
          <Button type="button" variant="secondary" size="lg">
            DEV: UI Palette
          </Button>
        </Link>
      </div>
    </main>
  );
}
