"use client";

import { useState, useEffect } from "react";
import Link from "next/link.js";
import type { Application } from "@/lib/generated/browser";
import { getApplications } from "@/app/actions/applications/get-applications";
import ApplicationsTable from "./ApplicationsTable";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      const data = await getApplications();
      setApplications(data);
      setLoading(false);
    }
    loadApplications();
  }, []);

  return (
    <main>
      <div>
        <h1>Applications</h1>
        <Link href="/applications/new">Add Applications</Link>
      </div>

      {loading ? (
        <p>Applications loading...</p>
      ) : (
        <ApplicationsTable applications={applications} />
      )}
    </main>
  );
}
