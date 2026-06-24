"use client";

import EditApplicationModal from "./EditApplicationModal";
import DeleteApplicationDialog from "./DeleteApplicationDialog";
import { Suspense, use, useState } from "react";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import Link from "next/link";
import tableStyles from "./ApplicationsTable.module.css";
import modalStyles from "./EditApplicationModal.module.css";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ApplicationWithDetails, GetResumesError, Result } from "@/lib/types";
import { Resume } from "@/lib/generated/client";

type ApplicationsTableProps = {
  applications: ApplicationWithDetails[];
  resumePromise: Promise<
    Result<{ resumes: Resume[]; totalCount: number }, GetResumesError>
  >;
};

export default function ApplicationsTable({
  applications,
  resumePromise,
}: ApplicationsTableProps) {
  const resumesResult = use(resumePromise);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingApplication, setEditingApplication] =
    useState<ApplicationWithDetails | null>(null);
  const [deletingApplication, setDeletingApplication] =
    useState<ApplicationWithDetails | null>(null);

  const columns: ColumnDef<ApplicationWithDetails>[] = [
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "dateApplied",
      header: "Date Applied",
      cell: ({ row }) =>
        row.original.dateApplied
          ? row.original.dateApplied.toLocaleDateString()
          : "",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          Created At
          {column.getIsSorted() === "asc" && " ↑"}
          {column.getIsSorted() === "desc" && " ↓"}
        </button>
      ),
      enableSorting: true,
      cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          Updated At
          {column.getIsSorted() === "asc" && " ↑"}
          {column.getIsSorted() === "desc" && " ↓"}
        </button>
      ),
      cell: ({ row }) => row.original.updatedAt.toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const application = row.original;
        return (
          <div className={tableStyles.action}>
            <Link href={`/applications/${application.id}`}>
              <Button type="button" size="sm" variant="primary">
                Details
              </Button>
            </Link>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditingApplication(application)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => setDeletingApplication(application)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (applications.length == 0) {
    return <p className={tableStyles.noApplications}>No applications found.</p>;
  }

  return (
    <div>
      <div className={tableStyles.filterRow}>
        <label>Filter by Status:</label>
        <select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "ALL"
          }
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("status")
              ?.setFilterValue(value === "ALL" ? undefined : value);
          }}
        >
          <option value="ALL">All</option>
          <option value="WISHLIST">Wishlist</option>
          <option value="APPLIED">Applied</option>
          <option value="OA_ASSESSMENT">OA / Assessment</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <table>
        <thead className={tableStyles.tableHead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={editingApplication !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingApplication(null);
          }
        }}
        title="Edit application"
        description="Update the details of your job application below."
      >
        {!resumesResult.ok ? (
          <p>
            [TEMP ERROR COMPONENT] Failed to load resumes. Please refresh the
            page and try again.
          </p>
        ) : editingApplication ? (
          <EditApplicationModal
            application={editingApplication}
            resumes={resumesResult.value.resumes}
            onClose={() => setEditingApplication(null)}
          />
        ) : null}
      </Modal>

      {deletingApplication && (
        <DeleteApplicationDialog
          application={deletingApplication}
          onClose={() => setDeletingApplication(null)}
        />
      )}
    </div>
  );
}
