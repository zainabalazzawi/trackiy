import { NextResponse } from "next/server";
import { requireProjectPermission } from "@/app/api/httpHelpers/guards";
import { parseJson } from "@/app/api/httpHelpers/validation";
import { UpdateColumnSchema } from "@/app/api/httpHelpers/schemas";
import { boardLanes } from "@/app/product/boardLanes";
import { errorResponse } from "@/app/api/httpHelpers/resultHttp";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { id: projectId, columnId } = await params;

    const guard = await requireProjectPermission(projectId, "manage_columns");
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, UpdateColumnSchema);
    if (!body.ok) return body.response;
    const { name, order } = body.data;

    const result = await boardLanes.rename(projectId, columnId, name, {
      ...(typeof order === "number" ? { order } : {}),
    });
    if (!result.ok) return errorResponse(result);

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const { id: projectId, columnId } = await params;

    const guard = await requireProjectPermission(projectId, "manage_columns");
    if (!guard.ok) return guard.response;

    const result = await boardLanes.delete(projectId, columnId);
    if (!result.ok) return errorResponse(result);

    return NextResponse.json({ success: true, deletedColumn: result.data });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    );
  }
}
