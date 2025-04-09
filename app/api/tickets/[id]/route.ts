import { Ticket } from "@/app/types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: id,
      },
      include: {
        status: true,
        column: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        description: body.description,
        title: body.title,
        priority: body.priority,
        assignee: body.assignee,
        ...(body.status && {
          statusId: body.status,
          columnId: (await prisma.column.findFirstOrThrow({
            where: { 
              statusId: body.status,
               projectId: body.projectId 
            },
          })).id
        })
      },
      include: { status: true, column: true }
    });

    return NextResponse.json(updatedTicket);

  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}