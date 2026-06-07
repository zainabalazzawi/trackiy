import { expect } from "vitest";

export function expectSuccess<T extends { ok: true }>(result: { ok: boolean }) {
  expect(result.ok).toBe(true);
  return result as T;
}

export async function expectFailure(
  result: { ok: boolean; response?: Response },
  status: number,
  error: string,
  issues?: { path: string; message: string }[]
) {
  expect(result.ok).toBe(false);
  expect(result.response!.status).toBe(status);
  const json = await result.response!.json();
  expect(json.error).toBe(error);
  if (issues) {
    expect(json.issues).toEqual(expect.arrayContaining(issues));
    expect(json.issues).toHaveLength(issues.length);
  } else {
    expect(json).toEqual({ error });
  }
}
