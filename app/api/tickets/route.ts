import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all tickets from projects where user is a member or creator
    const tickets = await prisma.ticket.findMany({
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
      include: {
        status: true,
        column: {
          include: {
            project: {
              select: { 
                id: true, 
                name: true, 
                key: true,
                type: true,
                category: true
              }
            }
          }
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
