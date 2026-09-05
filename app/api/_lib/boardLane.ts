import { prisma } from "@/lib/prisma";
import type { TicketFieldPatch } from "@/app/api/_lib/schemas";

export type BoardLaneCode = "NOT_FOUND" | "NOT_EMPTY" | "INVALID_REORDER";

export type BoardLaneResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: BoardLaneCode; message: string };

const fail = (
  code: BoardLaneCode,
  message: string
): { ok: false; code: BoardLaneCode; message: string } => ({
  ok: false,
  code,
  message,
});

const ok = <T>(data: T): { ok: true; data: T } => ({ ok: true, data });

const create = async (projectId: string, name: string) => {
  const highestOrderColumn = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0;

  const status = await prisma.status.create({
    data: {
      name,
      projectId,
    },
  });

  return prisma.column.create({
    data: {
      name,
      statusId: status.id,
      order: newOrder,
      projectId,
    },
    include: {
      status: true,
      tickets: true,
    },
  });
};

/** Create several lanes in one go (e.g. project template columns), ordered as given. */
const createMany = async (projectId: string, names: string[]) => {
  await prisma.$transaction(async (tx) => {
    const highestOrderColumn = await tx.column.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
    });
    const startOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0;

    for (const [index, name] of names.entries()) {
      const status = await tx.status.create({
        data: { name, projectId },
      });
      await tx.column.create({
        data: {
          name,
          statusId: status.id,
          order: startOrder + index,
          projectId,
        },
      });
    }
  });

  return list(projectId);
};

const list = async (projectId: string) => {
  return prisma.column.findMany({
    where: { projectId },
    include: {
      status: true,
      tickets: true,
    },
    orderBy: { order: "asc" },
  });
};

const requireColumn = async (projectId: string, columnId: string) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
  });

  if (!column || column.projectId !== projectId) {
    return fail("NOT_FOUND", "Column not found");
  }

  return ok(column);
};

const rename = async (
  projectId: string,
  columnId: string,
  name: string,
  options?: { order?: number }
) => {
  const existing = await requireColumn(projectId, columnId);
  if (!existing.ok) return existing;

  const column = await prisma.column.update({
    where: { id: columnId },
    data: {
      name,
      ...(typeof options?.order === "number" ? { order: options.order } : {}),
    },
    include: {
      status: true,
      tickets: true,
    },
  });

  await prisma.status.update({
    where: { id: column.statusId },
    data: { name },
  });

  return ok(column);
};

const reorder = async (projectId: string, orderedColumnIds: string[]) => {
  const existing = await prisma.column.findMany({
    where: { projectId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((c) => c.id));

  if (
    orderedColumnIds.length !== existingIds.size ||
    orderedColumnIds.some((id) => !existingIds.has(id))
  ) {
    return fail(
      "INVALID_REORDER",
      "Reorder must include every column in the project exactly once"
    );
  }

  await prisma.$transaction(
    orderedColumnIds.map((id, order) =>
      prisma.column.update({
        where: { id },
        data: { order },
      })
    )
  );

  return ok(await list(projectId));
};

const moveTicket = async (
  projectId: string,
  ticketId: string,
  columnId: string,
  fields?: TicketFieldPatch
) => {
  const columnResult = await requireColumn(projectId, columnId);
  if (!columnResult.ok) return columnResult;

  const column = columnResult.data;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      column: { projectId },
    },
  });

  if (!ticket) {
    return fail("NOT_FOUND", "Ticket not found");
  }

  // Lane move + any other field changes are one write so PATCH stays atomic.
  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      columnId: column.id,
      statusId: column.statusId,
      ...fields,
    },
    include: {
      status: true,
      assignee: { select: { id: true, name: true, email: true, image: true } },
      reporter: { select: { id: true, name: true, email: true, image: true } },
      column: {
        include: {
          project: {
            select: { id: true, name: true, key: true },
          },
        },
      },
    },
  });

  return ok(updated);
};

const deleteColumn = async (projectId: string, columnId: string) => {
  const existing = await requireColumn(projectId, columnId);
  if (!existing.ok) return existing;

  const column = existing.data;

  const ticketCount = await prisma.ticket.count({
    where: { columnId },
  });

  if (ticketCount > 0) {
    return fail("NOT_EMPTY", "Cannot delete a column that still has tickets");
  }

  const deletedColumn = await prisma.column.delete({
    where: { id: columnId },
  });

  const otherColumns = await prisma.column.count({
    where: { statusId: column.statusId },
  });
  const otherTickets = await prisma.ticket.count({
    where: { statusId: column.statusId },
  });

  if (otherColumns === 0 && otherTickets === 0) {
    await prisma.status.delete({
      where: { id: column.statusId },
    });
  }

  return ok(deletedColumn);
};

export const boardLane = {
  create,
  createMany,
  list,
  rename,
  reorder,
  moveTicket,
  delete: deleteColumn,
};
