import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const columns = await prisma.column.findMany({
      where: {
        projectId: id
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


export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name,  order } = body;

    const column = await prisma.column.update({
      where: { id },
      data: { name , order},
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, projectId } = body;

    const highestOrderColumn = await prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' }
    });

    const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0;

    // First create the status
    const status = await prisma.status.create({
      data: { name }
    });

    // Then create the column with the new status
    const column = await prisma.column.create({
      data: {
        name,
        statusId: status.id,
        order: newOrder,
        projectId // Add the projectId to associate the column with the project
      },
      include: {
        status: true,
        tickets: true
      }
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
