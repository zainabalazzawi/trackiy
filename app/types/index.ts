export interface Ticket {
  id: string;
  title: string;
  description: string;
  columnId: string;
  column: {
    id: string;
    name: string;
  };
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
  name: string;
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  order: number;
  tickets: Ticket[];
}

export type TicketInput = {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: string;
  reporter?: string;
};

