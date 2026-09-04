import { NextResponse } from "next/server";
import { requireProjectPermission } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { UpdateColumnSchema } from "@/app/api/_lib/schemas";
import { boardLane } from "@/app/api/_lib/boardLane";

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

    const result = await boardLane.rename(projectId, columnId, name, {
      ...(typeof order === "number" ? { order } : {}),
    });
    if (!result.ok) {
      const status = result.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: result.message }, { status });
    }

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

    const result = await boardLane.delete(projectId, columnId);
    if (!result.ok) {
      const status = result.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json({ success: true, deletedColumn: result.data });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    );
  }
}
