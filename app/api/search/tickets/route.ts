import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Simple search: find tickets by title or description
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        status: true,
        column: {
          include: {
            project: {
              select: { id: true, name: true, key: true }
            }
          }
        }
      },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error searching tickets:", error);
    return NextResponse.json({ error: "Failed to search tickets" }, { status: 500 });
  }
} 