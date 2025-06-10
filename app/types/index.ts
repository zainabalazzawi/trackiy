
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export interface Ticket {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  column: {
    id: string;
    name: string;
    projectId: string
  };
  statusId: string;
  status: {
    id: string;
    name: string;
  } | string;
  priority: Priority,
  assignee?: string;
  reporter?: string;
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
