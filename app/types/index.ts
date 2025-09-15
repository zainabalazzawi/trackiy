export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type InvitationStatus = 'pending' | 'accepted';
export type MemberSelection = string | "unassigned" | null;

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
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
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
  statusId: string;
  status: {
    id: string;
    name: string;
  } 
  priority: Priority,
  assignee?: string;
  reporter?: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Column {
  id: string;
  name: string;
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  order: number;
  tickets: Ticket[];
}
export type TicketInput = Omit<
  Ticket,
  "id" | "columnId" | "column" | "statusId" | "status"
>;

export interface Status {
  id: string;
  name: string;
  column: Column;
  tickets: Ticket[];
}

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
