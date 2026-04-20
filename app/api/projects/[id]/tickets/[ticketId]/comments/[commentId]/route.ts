import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string; commentId: string }> }
) {
  try {
    const { id: projectId, ticketId, commentId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
        ticketId,
        projectId,
      },
      select: { userId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
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
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string; commentId: string }> }
) {
  try {
    const { id: projectId, ticketId, commentId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
        ticketId,
        projectId,
      },
      select: { userId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
