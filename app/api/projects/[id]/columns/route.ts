import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { CreateColumnSchema } from "@/app/api/_lib/schemas";

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
