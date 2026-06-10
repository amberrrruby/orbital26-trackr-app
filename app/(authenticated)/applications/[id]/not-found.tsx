import Link from "next/link";
import { Button } from "@/app/components/Button";

export default function ApplicationNotFound() {
  return (
    <main>
      <Link href="/applications">
        <Button>← Back to Applications</Button>
      </Link>

      <h1>Application not found</h1>
      <p>
        This application does not exist, or you don&apos;t have permission to
        view it.
      </p>
    </main>
  );
}
