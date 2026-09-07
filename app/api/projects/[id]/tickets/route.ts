import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { CreateTicketSchema } from "@/app/api/_lib/schemas";
import { ticketInclude } from "@/app/api/_lib/ticketInclude";
import { ticketWrite } from "@/app/api/_lib/ticketWrite";
import { writeErrorResponse } from "@/app/api/_lib/writeHttp";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const tickets = await prisma.ticket.findMany({
      where: {
        column: {
          projectId: projectId,
        },
      },
      include: ticketInclude,
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
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

    const guard = await requireProjectPermission(projectId, "edit_ticket");
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const body = await parseJson(request, CreateTicketSchema);
    if (!body.ok) return body.response;

    const created = await ticketWrite.create(
      projectId,
      session.user.id,
      body.data
    );
    if (!created.ok) return writeErrorResponse(created);

    return NextResponse.json(created.data);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
