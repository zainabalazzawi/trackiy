import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let columns = await prisma.column.findMany({
      include: {
        status: true,
        tickets: true
      }
    });

    if (columns.length === 0) {
      const defaultStatuses = [
        "Ready to Development",
        "In Development",
        "Ready for Code Review",
        "Done"
      ];

      const createdStatuses = await Promise.all(
        defaultStatuses.map(name => 
          prisma.status.create({ data: { name } })
        )
      );

      columns = await Promise.all(
        createdStatuses.map((status, index) => 
          prisma.column.create({
            data: {
              name: status.name,
              statusId: status.id,
              order: index
            },
            include: {
              status: true,
              tickets: true
            }
          })
        )
      );
    }

    return NextResponse.json(columns);
  } catch (error) {
    console.error('Error fetching columns:', error);
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
        tickets: true
      }
    });

    await prisma.status.update({
      where: { id: column.statusId },
      data: { name }
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    );
  }
}
