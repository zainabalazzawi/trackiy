export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type InvitationStatus = 'pending' | 'accepted';
export type MemberSelection = string | "unassigned" | null;

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  image?: string;
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
  } | string;
  priority: Priority,
  assignee?: string;
  reporter?: string;
  createdAt: string;
  updatedAt: string;
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
