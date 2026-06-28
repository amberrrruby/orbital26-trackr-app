import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import styles from "./page.module.css";
import Link from "next/link.js";

export default async function AddNewResumePage() {
  const userId = await requireUserOrRedirectLogin();
  return (
    <main className={styles.page}>
      <Link href="/resumes">← Back to Resume Gallery</Link>

      <div className={styles.header}>
        <h1>Add Resume</h1>
        <p>Upload and fill in the details of a new resume.</p>
      </div>

      <ResumeFormComponent userId={userId} />
    </main>
  );
}
