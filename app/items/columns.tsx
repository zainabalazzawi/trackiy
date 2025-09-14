import { ColumnDef } from "@tanstack/react-table";
import { Ticket } from "@/app/types";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const columns: ColumnDef<Ticket>[] = [
  {
    id: "work",
    header: "Work",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div className="flex flex-row gap-2 text-sm">
          <Link
            href={`/projects/${ticket.column.project.id}/tickets/${ticket.id}`}
            className="font-light hover:underline text-lime-900"
          >
            {ticket.ticketNumber}
          </Link>
          <span>{ticket.title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = row.getValue("assignee") as string;
      return assignee || "Unassigned";
    },
  },
  {
    accessorKey: "reporter",
    header: "Reporter",
    cell: ({ row }) => {
      const reporter = row.getValue("reporter") as string;
      return reporter || "-";
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const priorityColors = {
        //check the priority
        LOW: "bg-green-100 text-green-800",
        MEDIUM: "bg-yellow-100 text-yellow-800",
        HIGH: "bg-red-100 text-red-800",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityColors[priority as keyof typeof priorityColors] ||
            "bg-gray-100 text-gray-800"
          }`}
        >
          {priority}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const ticket = row.original; 
      const statusName = ticket.status.name;
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {statusName}
        </span>
      );
    },
  },
  // {
  //   id: "resolution",
  //   header: "Resolution",
  //   cell: () => {
  //     return <span className="text-gray-400">-</span>;
  //   },
  // },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"));
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      return formatDate(row.getValue("updatedAt"));
    },
  },
];
