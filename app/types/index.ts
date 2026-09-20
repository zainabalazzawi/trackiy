export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type MemberSelection = string | "unassigned" | null;

// Simple constants
export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export interface Project {
  id: string;
  name: string;
  key: string;
  type: "TEAM_MANAGED" | "COMPANY_MANAGED";
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  lead: string | null;
  currentUserRole?: Role;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string; // ProjectMember record ID (for React keys)
  role: Role;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

import type { Ticket } from "@/app/product/ticketShape";
export type { Ticket };

export interface Column {
  id: string;
  name: string;
  order: number;
}
export type TicketInput = Omit<
  Ticket,
  "id" | "columnId" | "columnName" | "projectId" | "projectName"
>;

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  projectId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}
