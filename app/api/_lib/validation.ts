import { NextResponse } from "next/server";
import type { ZodSchema, ZodError } from "zod";

export type ValidationFailure = { ok: false; response: NextResponse };
export type ValidationOk<T> = { ok: true; data: T };

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns either { ok: true, data } or { ok: false, response: 400 } that
 * route handlers can `return` directly.
 */
export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationOk<T> | ValidationFailure> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = formatZodError(result.error);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: issues[0]?.message ?? "Invalid request body",
          issues,
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: result.data };
}

/**
 * Parse and validate URL search parameters against a Zod schema.
 */
export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): ValidationOk<T> | ValidationFailure {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });

  const result = schema.safeParse(obj);
  if (!result.success) {
    const issues = formatZodError(result.error);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: issues[0]?.message ?? "Invalid query parameters",
          issues,
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: result.data };
}
