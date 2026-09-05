import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import {
  CreateColumnSchema,
  ReorderColumnsSchema,
} from "@/app/api/_lib/schemas";
import { boardLane } from "@/app/api/_lib/boardLane";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guard = await requireProjectAccess(id);
    if (!guard.ok) return guard.response;

    const columns = await boardLane.list(id);

    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectPermission(projectId, "manage_columns");
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, CreateColumnSchema);
    if (!body.ok) return body.response;
    const { name } = body.data;

    const column = await boardLane.create(projectId, name);

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectPermission(projectId, "manage_columns");
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, ReorderColumnsSchema);
    if (!body.ok) return body.response;

    const result = await boardLane.reorder(projectId, body.data.columnIds);
    if (!result.ok) {
      const status = result.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error reordering columns:", error);
    return NextResponse.json(
      { error: "Failed to reorder columns" },
      { status: 500 }
    );
  }
}
