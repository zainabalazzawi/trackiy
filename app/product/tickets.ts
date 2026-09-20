import { prisma } from "@/lib/prisma";
import { boardLanes, requireBoardLane } from "@/app/product/boardLanes";
import type {
  CreateTicketInput,
  TicketFieldPatch,
} from "@/app/api/httpHelpers/schemas";
import { mapTicket, ticketInclude } from "@/app/product/ticketShape";
import { fail, ok, type ProductResult } from "@/app/product/result";

export type TicketCode = "NOT_FOUND";

export type TicketResult<T> = ProductResult<T, TicketCode>;

export type TicketPatch = TicketFieldPatch & { columnId?: string };

const requireTicket = async (projectId: string, ticketId: string) => {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      column: { projectId },
    },
  });

  if (!ticket) {
    return fail("NOT_FOUND", "Ticket not found");
  }

  return ok(ticket);
};

const create = async (
  projectId: string,
  reporterId: string,
  input: CreateTicketInput
) => {
  const lane = await boardLanes.firstLane(projectId);
  if (!lane.ok) return fail("NOT_FOUND", lane.message);

  const ticket = await prisma.$transaction(async (tx) => {
    const project = await tx.project.update({
      where: { id: projectId },
      data: { nextTicketSeq: { increment: 1 } },
      select: { key: true, nextTicketSeq: true },
    });
    const seq = project.nextTicketSeq - 1;
    const ticketNumber = `${project.key}-${seq}`;

    return tx.ticket.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        columnId: lane.data.id,
        priority: input.priority ?? "MEDIUM",
        assigneeId: input.assigneeId ?? null,
        reporterId,
        labels: input.labels ?? [],
        ticketNumber,
      },
      include: ticketInclude,
    });
  });

  return ok(mapTicket(ticket));
};

const patch = async (
  projectId: string,
  ticketId: string,
  fields: TicketPatch
) => {
  const { columnId, ...otherFields } = fields;

  if (columnId !== undefined) {
    const columnResult = await requireBoardLane(projectId, columnId);
    if (!columnResult.ok) return columnResult;
  }

  const existing = await requireTicket(projectId, ticketId);
  if (!existing.ok) return existing;

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ...(columnId !== undefined ? { columnId } : {}),
      ...otherFields,
    },
    include: ticketInclude,
  });

  return ok(mapTicket(updated));
};

const deleteTicket = async (projectId: string, ticketId: string) => {
  const existing = await requireTicket(projectId, ticketId);
  if (!existing.ok) return existing;

  const deleted = await prisma.ticket.delete({
    where: { id: ticketId },
  });

  return ok(deleted);
};

export const tickets = {
  create,
  patch,
  delete: deleteTicket,
};
