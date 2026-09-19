import { describe, expect, it } from "vitest";
import { writeErrorResponse } from "./writeHttp";

describe("writeErrorResponse", () => {
  it("maps NOT_FOUND to 404", async () => {
    const response = writeErrorResponse({
      ok: false,
      code: "NOT_FOUND",
      message: "Comment not found",
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Comment not found",
    });
  });

  it("maps FORBIDDEN to 403", async () => {
    const response = writeErrorResponse({
      ok: false,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("maps other failure codes to 400", async () => {
    const response = writeErrorResponse({
      ok: false,
      code: "ALREADY_MEMBER",
      message: "Already a member",
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Already a member",
    });
  });
});
