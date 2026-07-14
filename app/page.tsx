import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/Button";
import {
  ClipboardList,
  SquareKanban,
  Bell,
  Timeline,
  Files,
  ChartBarBig,
  BriefcaseBusiness,
} from "lucide-react";
import styles from "./page.module.css";
import { syncBuiltinESMExports } from "module";

const features = [
  {
    title: "Application Tracking",
    description: "Store every opportunity and update its progress.",
    icon: ClipboardList,
  },
  {
    title: "Kanban Pipeline",
    description:
      "Move applications between stages and view your pipeline at a glance.",
    icon: SquareKanban,
  },
  {
    title: "Smart Reminders",
    description:
      "Stay ahead of interviews, assessments, deadlines and follow-ups.",
    icon: Bell,
  },
  {
    title: "Application Timeline",
    description:
      "Review important updates and activities in chronological order.",
    icon: Timeline,
  },
  {
    title: "Resume Management",
    description:
      "Organize resume versions and track which one was used for each role.",
    icon: Files,
  },
  {
    title: "Analytics & Insights",
    description: "Understand application trends and identify what is working.",
    icon: ChartBarBig,
  },
];

export default async function Home() {
  return (
    <main className={styles.landingPage}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.navbar}`}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/trackr-logo.png"
              alt="Trackr logo"
              width={32}
              height={32}
              className={styles.logo}
              priority
            />

            <div className={styles.brandText}>
              <strong>Trackr</strong>
              <small>Apply. Track. Get Hired.</small>
            </div>
          </Link>

          <nav className={styles.navLinks} aria-label="Main navigation">
            <Button variant="ghost">
              <a href="#features">Features</a>
            </Button>

            <div className={styles.authActions}>
              <Button variant="outline">
                <Link href="/login">Log in</Link>
              </Button>

              <Button variant="primary">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <h1>
              Keep every application, deadline and next step in one place.
            </h1>

            <p className={styles.heroDescription}>
              Track applications, manage interviews and follow-ups, organize
              resume versions and understand your progress all from one
              workspace.
            </p>

            <div className={styles.heroActions}>
              <Button variant="primary">
                <Link href="/signup">Get started for free</Link>
              </Button>

              <Button variant="secondary">
                <Link href="/login">Log in</Link>
              </Button>
            </div>

            <p className={styles.heroNote}>
              No complicated setup. Start tracking in minutes.
            </p>
          </div>

          <div className={styles.productPreview}>
            <div className={styles.dashboardPlaceholder}>
              <span>Dashboard preview</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Everything you need</p>
            <h2>All the tools for a smarter job search</h2>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div className={styles.footerMessage}>
            <div className={styles.footerIntro}>
              <div className={styles.footerTitle}>
                <BriefcaseBusiness
                  size={16}
                  strokeWidth={1.8}
                  className={styles.footerIcon}
                  aria-hidden="true"
                />

                <p className={styles.footerLabel}>
                  Stay organized. Stay ready.
                </p>
              </div>
              <h2>Make your next application easier to manage.</h2>
            </div>

            <div className={styles.footerAbout}>
              <h3>About Trackr</h3>
              <p>
                Trackr is a simple job application tracker that helps students
                and job seekers organize applications, important events, resume
                versions and progress in one place.
              </p>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <small>© 2026 Trackr</small>
            <small>Apply. Track. Get Hired.</small>
          </div>
        </div>
      </footer>
    </main>
  );
}
