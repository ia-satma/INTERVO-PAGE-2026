import type { Permission } from "@/lib/cms/types";

export type AdminRole = "owner" | "admin" | "editor";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  owner: [
    "content:read",
    "content:write",
    "content:publish",
    "media:manage",
    "submissions:manage",
    "users:manage",
    "audit:read",
    "settings:manage",
  ],
  admin: [
    "content:read",
    "content:write",
    "content:publish",
    "media:manage",
    "submissions:manage",
    "audit:read",
    "settings:manage",
  ],
  editor: ["content:read", "content:write", "media:manage", "submissions:manage"],
};

export function permissionsForRole(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
