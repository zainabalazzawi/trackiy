export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type Permission =
  | "view"
  | "edit_ticket"
  | "manage_members"
  | "manage_columns"
  | "delete_project";

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

const PERMISSION_MIN_ROLE: Record<Permission, Role> = {
  view: "VIEWER",
  edit_ticket: "MEMBER",
  manage_members: "ADMIN",
  manage_columns: "ADMIN",
  delete_project: "OWNER",
};

export function roleAtLeast(role: Role | null | undefined, minRole: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  return roleAtLeast(role, PERMISSION_MIN_ROLE[permission]);
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

/** Roles assignable by ADMIN/OWNER (not OWNER). */
export const ASSIGNABLE_ROLES: Role[] = ["ADMIN", "MEMBER", "VIEWER"];
