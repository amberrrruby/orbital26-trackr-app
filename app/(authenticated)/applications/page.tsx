import Link from "next/link";
import { getApplications } from "@/app/actions/applications/get-applications";
import ApplicationsTable from "./ApplicationsTable";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <main>
      <div>
        <h1>Applications</h1>
        <Link href="/applications/new">Add Applications</Link>
      </div>

      <ApplicationsTable applications={applications} />
    </main>
  );
}
