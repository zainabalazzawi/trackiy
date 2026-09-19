import { NextResponse } from "next/server";
import { requireProjectPermission } from "@/app/api/httpHelpers/guards";
import { parseJson } from "@/app/api/httpHelpers/validation";
import { UpdateCommentSchema } from "@/app/api/httpHelpers/schemas";
import { commentWrite } from "@/app/domain/commentWrite";
import { writeErrorResponse } from "@/app/api/httpHelpers/writeHttp";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string; commentId: string }> }
) {
  try {
    const { id: projectId, ticketId, commentId } = await params;

    const guard = await requireProjectPermission(projectId, "edit_ticket");
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const body = await parseJson(request, UpdateCommentSchema);
    if (!body.ok) return body.response;

    const updated = await commentWrite.patch(
      projectId,
      ticketId,
      commentId,
      session.user.id,
      body.data
    );
    if (!updated.ok) return writeErrorResponse(updated);

    return NextResponse.json(updated.data);
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

    const guard = await requireProjectPermission(projectId, "edit_ticket");
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const deleted = await commentWrite.delete(
      projectId,
      ticketId,
      commentId,
      session.user.id
    );
    if (!deleted.ok) return writeErrorResponse(deleted);

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
