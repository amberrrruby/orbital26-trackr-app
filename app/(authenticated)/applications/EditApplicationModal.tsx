"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateApplication } from "@/app/actions/applications/update-application";
import { Application } from "@/lib/generated/browser";

const statusOptions = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Applied", value: "APPLIED" },
  { label: "OA/ Assessment", value: "OA_ASSESSMENT" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
];

type EditApplicationProps = {
  application: Application;
  onClose: () => void;
};

function formatDateForInput(date: Date | string) {
  return new Date(date).toISOString().split("T")[0];
}

export default function EditApplicationModal({
  application,
  onClose,
}: EditApplicationProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateApplication(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div>
      <h2>Edit Application</h2>
      <form action={handleSubmit}>
        {error && <p>{error}</p>}

        <input type="hidden" name="id" value={application.id} />

        <div>
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            defaultValue={application.company}
            required
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <input
            id="role"
            name="role"
            type="text"
            defaultValue={application.role}
            required
          />
        </div>

        <div>
          <label htmlFor="source">Source</label>
          <input
            id="source"
            name="source"
            type="text"
            defaultValue={application.source ?? ""}
          />
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            required
            defaultValue={application.status}
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dateApplied">Date Applied</label>
          <input
            id="dateApplied"
            name="dateApplied"
            type="date"
            defaultValue={formatDateForInput(application.dateApplied)}
          />
        </div>

        <div>
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" />
        </div>

        <div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
