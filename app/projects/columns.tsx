"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useDeleteProject } from "@/app/hooks/useProjects";
import { Project } from "@/app/types";
import { useState } from "react";

// Component for Actions cell to properly use hooks
function ActionsCell({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const { deleteProject, isDeleting } = useDeleteProject();

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
            }}
            className="text-red-800"
          >
            <Trash2 className="mr-2 text-red-800" size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This action
              cannot be undone and will delete all columns, tickets, and
              members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteProject(project.id);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Project>[] = [
  {
    id: "favorite",
    cell: () => (
      <Button variant="ghost" size="icon" className="h-4 w-4">
        <Star className="h-4 w-4 text-gray-400 hover:text-yellow-400" />
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            {project.key.charAt(0)}
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {project.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return type === "TEAM_MANAGED" ? "Team-managed " : "Service-management";
    },
  },
  {
    accessorKey: "createdBy",
    header: "Lead",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return (
        <div className="flex items-center gap-2">
          {/* {createdBy.image ? (
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={createdBy.image}
                alt={createdBy.name || ""}
                width={24}
                height={24}
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              {createdBy.name?.charAt(0) || "U"}
            </div>
          )} */}
          <span>{createdBy.name}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionsCell project={row.original} />;
    },
  },
];
