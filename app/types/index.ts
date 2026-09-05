export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type InvitationStatus = "pending" | "accepted";
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

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string;
  columnId: string;
  column: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
      key: string;
    };
  };
  priority: Priority;
  assigneeId?: string | null;
  assignee?: { id: string; name: string | null; email: string | null; image: string | null } | null;
  reporterId?: string | null;
  reporter?: { id: string; name: string | null; email: string | null; image: string | null } | null;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Column {
  id: string;
  name: string;
  order: number;
  tickets: Ticket[];
}
export type TicketInput = Omit<Ticket, "id" | "columnId" | "column">;

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
