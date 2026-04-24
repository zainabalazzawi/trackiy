import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "../../_lib/guards";
import { parseQuery } from "../../_lib/validation";
import { SearchTicketsQuerySchema } from "../../_lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const sessionGuard = await requireSession();
    if (!sessionGuard.ok) return sessionGuard.response;

    const parsed = parseQuery(
      request.nextUrl.searchParams,
      SearchTicketsQuerySchema
    );
    if (!parsed.ok) return parsed.response;
    const { q } = parsed.data;
    const userId = sessionGuard.session.user.id;

    const tickets = await prisma.ticket.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { ticketNumber: { contains: q, mode: "insensitive" } },
            ],
          },
          {
            column: {
              project: {
                OR: [
                  { userId },
                  { members: { some: { userId } } },
                ],
              },
            },
          },
        ],
      },
      include: {
        status: true,
        assignee: { select: { id: true, name: true, email: true, image: true } },
        reporter: { select: { id: true, name: true, email: true, image: true } },
        column: {
          include: {
            project: {
              select: { id: true, name: true, key: true },
            },
          },
        },
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error searching tickets:", error);
    return NextResponse.json(
      { error: "Failed to search tickets" },
      { status: 500 }
    );
  }
}
