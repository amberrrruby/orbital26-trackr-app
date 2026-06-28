"use client";

import EditApplicationModal from "./EditApplicationModal";
import DeleteApplicationDialog from "./DeleteApplicationDialog";
import { Suspense, use, useState } from "react";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { Input } from "@/app/components/Input";
import Link from "next/link";
import tableStyles from "./ApplicationsTable.module.css";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { ApplicationWithDetails, GetResumesError, Result } from "@/lib/types";
import { Resume } from "@/lib/generated/client";
import { getImportantDateValues } from "./importantDatesUtils";
import { Eye, Pencil, Trash2, Search } from "lucide-react";

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingApplication, setEditingApplication] =
    useState<ApplicationWithDetails | null>(null);

  const importantDates = editingApplication
    ? getImportantDateValues(editingApplication.timelineEvents)
    : {
        oaAssessmentDate: "",
        interviewDate: "",
        offerExpiryDate: "",
      };

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
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          Date Applied
          {column.getIsSorted() === "asc" && " ↑"}
          {column.getIsSorted() === "desc" && " ↓"}
        </button>
      ),
      enableSorting: true,
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
            <Link href={`/applications/${application.id}`} title="Details">
              <Eye size={18} className={tableStyles.icon} />
            </Link>

            <button
              type="button"
              title="Edit"
              onClick={() => setEditingApplication(application)}
            >
              <Pencil size={18} className={tableStyles.icon} />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => setDeletingApplication(application)}
              className={tableStyles.deleteAction}
            >
              <Trash2 size={18} className={tableStyles.icon} />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    state: { sorting, columnFilters, pagination, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,

    globalFilterFn: "includesString",
  });

  if (applications.length == 0) {
    return <p className={tableStyles.noApplications}>No applications found.</p>;
  }

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <div className={tableStyles.search}>
          <Search
            size={16}
            className={tableStyles.searchIcon}
            aria-hidden="true"
          />
          <Input
            type="search"
            value={globalFilter}
            placeholder="Search company, role or source..."
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
          />
        </div>

        <div className={tableStyles.filterRow}>
          <label>Filter by Status:</label>
          <select
            id="status-filter"
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              const value = event.target.value;
              table.getColumn("status")?.setFilterValue(value);
              table.setPageIndex(0);
            }}
          >
            <option value="">All</option>
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
            <option value="OA_ASSESSMENT">OA / Assessment</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <table>
        <thead className={tableStyles.tableHead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={
                    header.column.id === "company"
                      ? tableStyles.companyColumn
                      : header.column.id === "role"
                        ? tableStyles.roleColumn
                        : header.column.id === "source"
                          ? tableStyles.sourceColumn
                          : undefined
                  }
                >
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
                <td
                  key={cell.id}
                  className={
                    cell.column.id === "company"
                      ? tableStyles.companyColumn
                      : cell.column.id === "role"
                        ? tableStyles.roleColumn
                        : cell.column.id === "source"
                          ? tableStyles.sourceColumn
                          : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={tableStyles.pagination}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          &lt;
        </Button>

        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          &gt;
        </Button>
      </div>

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
            importantDates={importantDates}
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
