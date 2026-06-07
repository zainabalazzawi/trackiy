import { describe, expect, it } from "vitest";
import { z } from "zod";
import { expectFailure, expectSuccess } from "@/test/helpers";
import { parseJson, parseQuery } from "./validation";

const TestBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  count: z.coerce.number().int().min(0, "Count cannot be negative"),
});

const TestQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  page: z.coerce.number().int().optional(),
});

function jsonRequest(body: unknown): Request {
  const payload = typeof body === "string" ? body : JSON.stringify(body);

  return new Request("http://test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
}

describe("parseJson", () => {
  it("returns 400 when the body is not valid JSON", async () => {
    await expectFailure(
      await parseJson(jsonRequest("not-json"), TestBodySchema),
      400,
      "Invalid JSON body"
    );
  });

  it("returns 400 when the body is empty", async () => {
    await expectFailure(
      await parseJson(jsonRequest(""), TestBodySchema),
      400,
      "Invalid JSON body"
    );
  });

  it("returns 400 when valid JSON has the wrong shape", async () => {
    await expectFailure(
      await parseJson(jsonRequest([]), TestBodySchema),
      400,
      "Expected object, received array",
      [{ path: "", message: "Expected object, received array" }]
    );
  });

  it("returns 400 with issues when the body fails schema validation", async () => {
    await expectFailure(
      await parseJson(jsonRequest({ name: "", count: -1 }), TestBodySchema),
      400,
      "Name is required",
      [
        { path: "name", message: "Name is required" },
        { path: "count", message: "Count cannot be negative" },
      ]
    );
  });

  it("returns parsed data when the body is valid", async () => {
    const result = expectSuccess<{ ok: true; data: z.infer<typeof TestBodySchema> }>(
      await parseJson(jsonRequest({ name: "Trackiy", count: "3" }), TestBodySchema)
    );
    expect(result.data).toEqual({ name: "Trackiy", count: 3 });
  });
});

describe("parseQuery", () => {
  it("returns 400 with issues when query params fail schema validation", async () => {
    await expectFailure(
      parseQuery(new URLSearchParams("q="), TestQuerySchema),
      400,
      "Search query is required",
      [{ path: "q", message: "Search query is required" }]
    );
  });

  it("returns 400 when required query params are missing", async () => {
    await expectFailure(
      parseQuery(new URLSearchParams(), TestQuerySchema),
      400,
      "Required",
      [{ path: "q", message: "Required" }]
    );
  });

  it("returns parsed data when query params are valid", () => {
    const result = expectSuccess<{ ok: true; data: z.infer<typeof TestQuerySchema> }>(
      parseQuery(new URLSearchParams("q=hello&page=2"), TestQuerySchema)
    );
    expect(result.data).toEqual({ q: "hello", page: 2 });
  });

  it("returns parsed data when optional query params are omitted", () => {
    const result = expectSuccess<{ ok: true; data: z.infer<typeof TestQuerySchema> }>(
      parseQuery(new URLSearchParams("q=hello"), TestQuerySchema)
    );
    expect(result.data).toEqual({ q: "hello" });
  });
});
