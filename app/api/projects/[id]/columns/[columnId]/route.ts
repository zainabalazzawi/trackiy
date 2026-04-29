import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { UpdateColumnSchema } from "@/app/api/_lib/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { id: projectId, columnId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, UpdateColumnSchema);
    if (!body.ok) return body.response;
    const { name, order } = body.data;

    const existing = await prisma.column.findUnique({
      where: { id: columnId },
      select: { projectId: true, statusId: true },
    });

    if (!existing || existing.projectId !== projectId) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    const column = await prisma.column.update({
      where: { id: columnId },
      data: {
        name,
        ...(typeof order === "number" ? { order } : {}),
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

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { id: projectId, columnId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { statusId: true, projectId: true },
    });

    if (!column || column.projectId !== projectId) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
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

    return NextResponse.json({ success: true, deletedColumn });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    );
  }
}
