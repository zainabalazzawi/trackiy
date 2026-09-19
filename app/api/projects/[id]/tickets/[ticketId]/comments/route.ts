import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/httpHelpers/guards";
import { parseJson } from "@/app/api/httpHelpers/validation";
import { CreateCommentSchema } from "@/app/api/httpHelpers/schemas";
import { comments } from "@/app/product/comments";
import { errorResponse } from "@/app/api/httpHelpers/resultHttp";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { id: projectId, ticketId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const comments = await prisma.comment.findMany({
      where: {
        ticketId,
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { id: projectId, ticketId } = await params;

    const guard = await requireProjectPermission(projectId, "edit_ticket");
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const body = await parseJson(request, CreateCommentSchema);
    if (!body.ok) return body.response;

    const created = await comments.create(
      projectId,
      ticketId,
      session.user.id,
      body.data
    );
    if (!created.ok) return errorResponse(created);

    return NextResponse.json(created.data);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
