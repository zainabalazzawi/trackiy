import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/lib/auth";

// POST /api/typing - Start typing indicator
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, fieldId } = await request.json();

    // Upsert typing indicator
    await prisma.typingIndicator.upsert({
      where: {
        uniqueKey: {
          ticketId,
          fieldId,
          userId: session.user.id,
        },
      },
      update: {
        lastActivity: new Date(),
      },
      create: {
        ticketId,
        fieldId,
        userId: session.user.id,
        lastActivity: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting typing indicator:", error);
    return NextResponse.json(
      { error: "Failed to start typing indicator" },
      { status: 500 }
    );
  }
}

// DELETE /api/typing - Stop typing indicator
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;

    const ticketId = searchParams.get("ticketId") || "";
    const fieldId = searchParams.get("fieldId") || "";

    await prisma.typingIndicator.deleteMany({
      where: {
        ticketId,
        fieldId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error stopping typing indicator:", error);
    return NextResponse.json(
      { error: "Failed to stop typing indicator" },
      { status: 500 }
    );
  }
}

// GET /api/typing?ticketId=X&fieldId=Y - Get current typing users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get("ticketId") || "";
    const fieldId = searchParams.get("fieldId") || "";

    // Get typing users (last 5 seconds)
    const typingUsers = await prisma.typingIndicator.findMany({
      where: {
        ticketId,
        fieldId,
        lastActivity: {
          gte: new Date(Date.now() - 5000), // Last 5 seconds
        },
        userId: {
          not: session.user.id, // Exclude current user
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(typingUsers);
  } catch (error) {
    console.error("Error fetching typing indicators:", error);
    return NextResponse.json(
      { error: "Failed to fetch typing indicators" },
      { status: 500 }
    );
  }
}
