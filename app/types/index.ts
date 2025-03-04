
export interface Ticket {
  id: string;
  title: string;
  description: string;
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: string;
  reporter?: string;
}

export interface Column {
  id: string;
  title: string;
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  order: number;
  tickets: Ticket[];
}

export type TicketInput = Omit<Ticket, "id" | "createdAt" | "updatedAt">;

