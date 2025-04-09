"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Project = {
  id: string
  name: string
  key: string
  type: "TEAM_MANAGED" | "COMPANY_MANAGED"
  createdBy: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  lead: string | null
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
      const project = row.original
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            {project.key.charAt(0)}
          </div>
          <span className="text-blue-600 hover:underline cursor-pointer">
            {project.name}
          </span>
        </div>
      )
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
      const type = row.getValue("type") as string
      return type === "TEAM_MANAGED" ? "Team-managed " : "Service-management"
    },
  },
  {
    accessorKey: "createdBy",
    header: "Lead",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy
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
      )
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 