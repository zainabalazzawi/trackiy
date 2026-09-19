import { describe, expect, it } from "vitest";
import { errorResponse } from "./resultHttp";

describe("errorResponse", () => {
  it("maps NOT_FOUND to 404", async () => {
    const response = errorResponse({
      ok: false,
      code: "NOT_FOUND",
      message: "missing",
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "missing" });
  });

  it("maps FORBIDDEN to 403", async () => {
    const response = errorResponse({
      ok: false,
      code: "FORBIDDEN",
      message: "nope",
    });
    expect(response.status).toBe(403);
  });

  it("maps other codes to 400", async () => {
    const response = errorResponse({
      ok: false,
      code: "NOT_EMPTY",
      message: "busy",
    });
    expect(response.status).toBe(400);
  });
});
