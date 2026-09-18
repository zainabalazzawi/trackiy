import { describe, expect, it } from "vitest";
import { UpdateTicketSchema } from "./schemas";

describe("UpdateTicketSchema", () => {
  it("accepts { columnId }", () => {
    const result = UpdateTicketSchema.safeParse({ columnId: "col_1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ columnId: "col_1" });
    }
  });

  it("accepts { columnId, title }", () => {
    const result = UpdateTicketSchema.safeParse({
      columnId: "col_1",
      title: "x",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ columnId: "col_1", title: "x" });
    }
  });

  it("strips statusId from parsed output", () => {
    const result = UpdateTicketSchema.safeParse({
      columnId: "col_1",
      statusId: "status_1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ columnId: "col_1" });
      expect(result.data).not.toHaveProperty("statusId");
    }
  });

  it("rejects empty object", () => {
    const result = UpdateTicketSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "At least one field must be provided"
      );
    }
  });
});
