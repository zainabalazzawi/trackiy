import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/lib/auth";

// DELETE - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string; commentId: string }> }
) {
  try {
    const { id: projectId, ticketId, commentId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the comment to check ownership
    const comment = await prisma.comment.findUnique({
      where: { 
        id: commentId,
        ticketId,
        projectId
      },
      include: { user: true }
    });

    // Check if user owns the comment
    if (comment?.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
