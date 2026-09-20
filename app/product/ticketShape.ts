import { z } from "zod";
import { PrioritySchema } from "@/app/api/httpHelpers/schemas";

const TicketPersonSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable(),
  })
  .nullable();

export const TicketSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: PrioritySchema,
  labels: z.array(z.string()).optional(),
  columnId: z.string(),
  columnName: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  assigneeId: z.string().nullable().optional(),
  assignee: TicketPersonSchema.optional(),
  reporterId: z.string().nullable().optional(),
  reporter: TicketPersonSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Ticket = z.infer<typeof TicketSchema>;

/** Shared Prisma include for ticket rows that feed mapTicket. */
export const ticketInclude = {
  assignee: { select: { id: true, name: true, email: true, image: true } },
  reporter: { select: { id: true, name: true, email: true, image: true } },
  column: {
    include: {
      project: {
        select: { id: true, name: true, key: true },
      },
    },
  },
} as const;

/** Fields mapTicket reads from a Prisma ticket + ticketInclude row. */
type TicketRow = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  labels: string[];
  columnId: string;
  assigneeId: string | null;
  reporterId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  assignee: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  reporter: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  column: {
    name: string;
    project: { id: string; name: string } | null;
  };
};

export function mapTicket(row: TicketRow): Ticket {
  if (!row.column.project) {
    throw new Error(`Ticket ${row.id} column is missing project`);
  }

  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    title: row.title,
    description: row.description,
    priority: row.priority,
    labels: row.labels,
    columnId: row.columnId,
    columnName: row.column.name,
    projectId: row.column.project.id,
    projectName: row.column.project.name,
    assigneeId: row.assigneeId,
    assignee: row.assignee,
    reporterId: row.reporterId,
    reporter: row.reporter,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

export function mapTickets(rows: TicketRow[]): Ticket[] {
  return rows.map(mapTicket);
}
