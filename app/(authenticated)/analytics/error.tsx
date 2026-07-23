"use client";

import ErrorDisplay from "@/app/components/ErrorDisplay";
import { Button } from "@/app/components/Button";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <ErrorDisplay
        title="Failed to load analytics"
        message="An internal error occurred while fetching your analytics data. Please try again."
      />
      <Button onClick={reset} variant="ghost">
        Retry
      </Button>
    </main>
  );
}
