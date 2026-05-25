import Link from "next/link.js";
import AddApplicationForm from "../AddApplicationForm";

export default function NewApplicationPage() {
  return (
    <main>
      <Link href="/applications">Back to Applications</Link>

      <h1>Add Application</h1>
      <div>
        <AddApplicationForm />
      </div>
    </main>
  );
}
