import { describe, expect, it } from "vitest";
import {
  type Permission,
  type Role,
  hasPermission,
  roleAtLeast,
} from "./permissions";

const ROLES: Role[] = ["VIEWER", "MEMBER", "ADMIN", "OWNER"];
const PERMISSIONS: Permission[] = [
  "view",
  "edit_ticket",
  "manage_members",
  "manage_columns",
  "delete_project",
];

describe("roleAtLeast", () => {
  it.each([null, undefined])("returns false when role is %s", (role) => {
    expect(roleAtLeast(role, "VIEWER")).toBe(false);
  });

  it.each([
    ["VIEWER", "VIEWER", true],
    ["MEMBER", "VIEWER", true],
    ["ADMIN", "VIEWER", true],
    ["OWNER", "VIEWER", true],
    ["VIEWER", "MEMBER", false],
    ["MEMBER", "MEMBER", true],
    ["ADMIN", "MEMBER", true],
    ["OWNER", "MEMBER", true],
    ["VIEWER", "ADMIN", false],
    ["MEMBER", "ADMIN", false],
    ["ADMIN", "ADMIN", true],
    ["OWNER", "ADMIN", true],
    ["VIEWER", "OWNER", false],
    ["MEMBER", "OWNER", false],
    ["ADMIN", "OWNER", false],
    ["OWNER", "OWNER", true],
  ] as const)("role %s meets min %s -> %s", (role, minRole, expected) => {
    expect(roleAtLeast(role, minRole)).toBe(expected);
  });
});

describe("hasPermission", () => {
  const expectedByRole: Record<Role, Record<Permission, boolean>> = {
    VIEWER: {
      view: true,
      edit_ticket: false,
      manage_members: false,
      manage_columns: false,
      delete_project: false,
    },
    MEMBER: {
      view: true,
      edit_ticket: true,
      manage_members: false,
      manage_columns: false,
      delete_project: false,
    },
    ADMIN: {
      view: true,
      edit_ticket: true,
      manage_members: true,
      manage_columns: true,
      delete_project: false,
    },
    OWNER: {
      view: true,
      edit_ticket: true,
      manage_members: true,
      manage_columns: true,
      delete_project: true,
    },
  };

  it.each(ROLES.flatMap((role) => PERMISSIONS.map((permission) => [role, permission] as const)))(
    "role %s has permission %s according to policy",
    (role, permission) => {
      expect(hasPermission(role, permission)).toBe(expectedByRole[role][permission]);
    }
  );

  it.each(
    [null, undefined].flatMap((role) =>
      PERMISSIONS.map((permission) => [role, permission] as const)
    )
  )("returns false when role is %s for permission %s", (role, permission) => {
    expect(hasPermission(role, permission)).toBe(false);
  });
});
