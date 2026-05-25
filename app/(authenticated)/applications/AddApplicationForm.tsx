"use client";

import { useState } from "react";
import { createApplication } from "@/app/actions/applications/create-application";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA/ Assessment", value: "OA_ASSESSMENT" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AddApplicationForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createApplication(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <p>{error}</p>}

      <div>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" required />
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <input id="role" name="role" type="text" required />
      </div>

      <div>
        <label htmlFor="source">Source</label>
        <input id="source" name="source" type="text" />
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select id="status" name="status" required defaultValue="APPLIED">
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dateApplied">Date Applied</label>
        <input id="dateApplied" name="dateApplied" type="date" />
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" />
      </div>

      <button type="submit">Create Application</button>
    </form>
  );
}
