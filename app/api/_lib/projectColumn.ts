import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/app/api/_lib/writeResult";

/** Column must exist and belong to the project. */
export const requireProjectColumn = async (
  projectId: string,
  columnId: string
) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
  });

  if (!column || column.projectId !== projectId) {
    return fail("NOT_FOUND", "Column not found");
  }

  return ok(column);
};
