import { NextResponse } from "next/server";

/** Map a write-module failure (`NOT_FOUND` → 404, else 400) to a JSON response. */
export function writeErrorResponse(result: {
  ok: false;
  code: string;
  message: string;
}) {
  const status = result.code === "NOT_FOUND" ? 404 : 400;
  return NextResponse.json({ error: result.message }, { status });
}
