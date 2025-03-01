export type Status = 'READY_TO_DEVELOP' | 'IN_DEVELOPMENT' | 'CODE_REVIEW' | 'DONE';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: Status;
  assignee?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  reporter?: string
}

export interface Column {
  id: Status;
  title: string;
  tickets: Ticket[];
} 