import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "../../httpHelpers/guards";
import { parseQuery } from "../../httpHelpers/validation";
import { SearchTicketsQuerySchema } from "../../httpHelpers/schemas";
import { mapTickets, ticketInclude } from "@/app/product/ticketShape";

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

    const rows = await prisma.ticket.findMany({
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
      include: ticketInclude,
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(mapTickets(rows));
  } catch (error) {
    console.error("Error searching tickets:", error);
    return NextResponse.json(
      { error: "Failed to search tickets" },
      { status: 500 }
    );
  }
}
