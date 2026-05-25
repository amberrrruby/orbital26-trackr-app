"use client";

import { Application } from "@/lib/generated/browser";
import { useState } from "react";
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

type ApplicationsTableProps = {
  applications: Application[];
};

export default function ApplicationsTable({
  applications,
}: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Application>[] = [
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
      cell: ({ row }) => row.original.dateApplied.toLocaleDateString(),
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
    return <p>No applications found.</p>;
  }

  return (
    <div>
      <div>
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
        <thead>
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
    </div>
  );
}
