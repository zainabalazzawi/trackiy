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

  return prisma.column.create({
    data: {
      name,
      order: newOrder,
      projectId,
    },
    include: {
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
      await tx.column.create({
        data: {
          name,
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
      tickets: true,
    },
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
      ...fields,
    },
    include: {
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

  const ticketCount = await prisma.ticket.count({
    where: { columnId },
  });

  if (ticketCount > 0) {
    return fail("NOT_EMPTY", "Cannot delete a column that still has tickets");
  }

  const deletedColumn = await prisma.column.delete({
    where: { id: columnId },
  });

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
