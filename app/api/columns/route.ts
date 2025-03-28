import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let columns = await prisma.column.findMany({
      include: {
        status: true,
        tickets: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (columns.length === 0) {
      const defaultStatuses = [
        "Ready to Development",
        "In Development",
        "Ready for Code Review",
        "Done",
      ];

      // First check if statuses exist
      const existingStatuses = await prisma.status.findMany({
        where: {
          name: {
            in: defaultStatuses,
          },
        },
      });

      // Only create statuses that don't exist
      const statusesToCreate = defaultStatuses.filter(
        (name) => !existingStatuses.find((status) => status.name === name)
      );

      const newStatuses = await Promise.all(
        statusesToCreate.map((name) => prisma.status.create({ data: { name } }))
      );

      // Combine existing and new statuses
      const allStatuses = [...existingStatuses, ...newStatuses];

      // Create columns for all statuses
      columns = await Promise.all(
        allStatuses.map((status, index) =>
          prisma.column.create({
            data: {
              name: status.name,
              statusId: status.id,
              order: index,
            },
            include: {
              status: true,
              tickets: true,
            },
          })
        )
      );
    }

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
    const { id, name } = body;

    const column = await prisma.column.update({
      where: { id },
      data: { name },
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
    const { name } = body;

    const highestOrderColumn = await prisma.column.findFirst();

    const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0;

    const status = await prisma.status.findUniqueOrThrow({
      where: { name }
    });

    const column = await prisma.column.create({
      data: {
        name,
        statusId: status.id,
        order: newOrder
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
