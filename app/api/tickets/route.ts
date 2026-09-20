import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/lib/auth";
import { mapTickets, ticketInclude } from "@/app/product/ticketShape";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all tickets from projects where user is a member or creator
    const rows = await prisma.ticket.findMany({
      where: {
        column: {
          project: {
            OR: [
              // Projects created by the user
              { userId: session.user.id },
              // Projects where the user is a member
              {
                members: {
                  some: {
                    userId: session.user.id
                  }
                }
              }
            ]
          }
        }
      },
      include: ticketInclude,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(mapTickets(rows));
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
