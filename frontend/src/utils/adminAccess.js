const ADMIN_DASHBOARD_ROLES = ["admin", "owner", "staff"];
const ADMIN_MANAGE_ROLES = ["admin", "owner"];

export const hasAdminDashboardAccess = (user) =>
  ADMIN_DASHBOARD_ROLES.includes((user?.role || "").toLowerCase());

export const canManageAdminDashboard = (user) =>
  ADMIN_MANAGE_ROLES.includes((user?.role || "").toLowerCase());

export const isStaffReadOnlyAdmin = (user) =>
  (user?.role || "").toLowerCase() === "staff";

export const canManageUsersAdmin = (user) =>
  (user?.role || "").toLowerCase() === "admin";
