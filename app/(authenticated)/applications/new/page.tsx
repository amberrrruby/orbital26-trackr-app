import Link from "next/link.js";
import AddApplicationForm from "../AddApplicationForm";
import { Button } from "@/app/components/Button";
import styles from "./page.tsx.module.css";

export default function NewApplicationPage() {
  return (
    <main className={styles.page}>
      <Link href="/applications">
        <Button>← Back to Applications</Button>
      </Link>

      <div className={styles.header}>
        <h1>Add Application</h1>
        <p>Fill in the details of a new job application.</p>
      </div>
      <div>
        <AddApplicationForm />
      </div>
    </main>
  );
}
