import Link from "next/link";
import { Button } from "@/app/components/Button";
import ErrorDisplay from "@/app/components/ErrorDisplay";

export default function ApplicationNotFound() {
  return (
    <main>
      <Link href="/applications">
        <Button>Back to Applications</Button>
      </Link>

      <ErrorDisplay
        title="Application not found"
        message="This application does not exist, or you don't have permission to view it."
      />
    </main>
  );
}
