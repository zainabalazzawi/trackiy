import { NextResponse } from "next/server";

/** Map a write-module failure to a JSON response. */
export function writeErrorResponse(result: {
  ok: false;
  code: string;
  message: string;
}) {
  const status =
    result.code === "NOT_FOUND"
      ? 404
      : result.code === "FORBIDDEN"
        ? 403
        : 400;
  return NextResponse.json({ error: result.message }, { status });
}
