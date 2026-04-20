import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "../_lib/guards";
import { parseJson, parseQuery } from "../_lib/validation";
import { TypingBodySchema, TypingQuerySchema } from "../_lib/schemas";

export async function POST(request: Request) {
  try {
    const sessionGuard = await requireSession();
    if (!sessionGuard.ok) return sessionGuard.response;
    const { session } = sessionGuard;

    const body = await parseJson(request, TypingBodySchema);
    if (!body.ok) return body.response;
    const { ticketId, fieldId } = body.data;

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

export async function DELETE(request: NextRequest) {
  try {
    const sessionGuard = await requireSession();
    if (!sessionGuard.ok) return sessionGuard.response;
    const { session } = sessionGuard;

    const parsed = parseQuery(request.nextUrl.searchParams, TypingQuerySchema);
    if (!parsed.ok) return parsed.response;
    const { ticketId, fieldId } = parsed.data;

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

export async function GET(request: NextRequest) {
  try {
    const sessionGuard = await requireSession();
    if (!sessionGuard.ok) return sessionGuard.response;
    const { session } = sessionGuard;

    const parsed = parseQuery(request.nextUrl.searchParams, TypingQuerySchema);
    if (!parsed.ok) return parsed.response;
    const { ticketId, fieldId } = parsed.data;

    const typingUsers = await prisma.typingIndicator.findMany({
      where: {
        ticketId,
        fieldId,
        lastActivity: {
          gte: new Date(Date.now() - 5000),
        },
        userId: {
          not: session.user.id,
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
