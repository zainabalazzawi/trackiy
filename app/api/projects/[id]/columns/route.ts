import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import {
  CreateColumnSchema,
  UpdateColumnSchema,
  DeleteColumnSchema,
} from "@/app/api/_lib/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireProjectAccess(id);
    if (!guard.ok) return guard.response;

    const columns = await prisma.column.findMany({
      where: {
        projectId: id,
      },
      include: {
        status: true,
        tickets: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, UpdateColumnSchema);
    if (!body.ok) return body.response;
    const { id, name, order } = body.data;

    const existing = await prisma.column.findUnique({
      where: { id },
      select: { projectId: true, statusId: true },
    });

    if (!existing || existing.projectId !== projectId) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    const column = await prisma.column.update({
      where: { id },
      data: { name, order },
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, CreateColumnSchema);
    if (!body.ok) return body.response;
    const { name } = body.data;

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

    const column = await prisma.column.create({
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

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, DeleteColumnSchema);
    if (!body.ok) return body.response;
    const { id } = body.data;

    const column = await prisma.column.findUnique({
      where: { id },
      select: { statusId: true, projectId: true },
    });

    if (!column || column.projectId !== projectId) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    const deletedColumn = await prisma.column.delete({
      where: { id },
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
