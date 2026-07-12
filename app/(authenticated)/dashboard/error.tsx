"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Failed to load dashboard</h2>
      <p>An internal error occurred while fetching your data.</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
