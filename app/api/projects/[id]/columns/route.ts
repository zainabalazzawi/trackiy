import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/httpHelpers/guards";
import { parseJson } from "@/app/api/httpHelpers/validation";
import {
  CreateColumnSchema,
  ReorderColumnsSchema,
} from "@/app/api/httpHelpers/schemas";
import { boardLane } from "@/app/domain/boardLane";
import { writeErrorResponse } from "@/app/api/httpHelpers/writeHttp";

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
    if (!result.ok) return writeErrorResponse(result);

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error reordering columns:", error);
    return NextResponse.json(
      { error: "Failed to reorder columns" },
      { status: 500 }
    );
  }
}
