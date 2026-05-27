"use client";

import { useState, useEffect } from "react";
import type { Application } from "@/lib/generated/browser";
import { getApplications } from "@/app/actions/applications/get-applications";
import ApplicationsTable from "./ApplicationsTable";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  // eliminate entirely?
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
      <h1>Applications</h1>

      {loading ? (
        <p>Applications loading...</p>
      ) : (
        <ApplicationsTable applications={applications} />
      )}
    </main>
  );
}
