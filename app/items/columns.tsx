import { ColumnDef } from "@tanstack/react-table";
import { Ticket, Priority } from "@/app/types";
import Link from "next/link";
import { formatDate, getAssigneeName, getPriorityClasses } from "@/lib/utils";
import { useProjects } from "@/app/hooks/useProjects";
import { Badge } from "@/components/ui/badge";

// Simple component to get user name from assignee
const AssigneeName = ({ assignee }: { assignee: string }) => {
  const { projects } = useProjects();
  return getAssigneeName(assignee, projects || []);
};

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
      return <AssigneeName assignee={assignee} />;
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
      const priority = row.getValue("priority") as Priority;
      return (
        <Badge className={getPriorityClasses(priority)}>
          {priority}
        </Badge>
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
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {statusName}
        </Badge>
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
