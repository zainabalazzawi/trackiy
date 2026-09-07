import { prisma } from "@/lib/prisma";
import { requireProjectColumn } from "@/app/api/_lib/projectColumn";
import { fail, ok, type WriteResult } from "@/app/api/_lib/writeResult";

export type BoardLaneCode = "NOT_FOUND" | "NOT_EMPTY" | "INVALID_REORDER";

export type BoardLaneResult<T> = WriteResult<T, BoardLaneCode>;

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

/** Default board lane for new tickets: the column with order 0. */
const firstLane = async (projectId: string) => {
  const column = await prisma.column.findFirst({
    where: {
      projectId,
      order: 0,
    },
  });

  if (!column) {
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
  const existing = await requireProjectColumn(projectId, columnId);
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

const deleteColumn = async (projectId: string, columnId: string) => {
  const existing = await requireProjectColumn(projectId, columnId);
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
  firstLane,
  rename,
  reorder,
  delete: deleteColumn,
};
