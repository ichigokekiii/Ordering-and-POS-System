const ADMIN_DASHBOARD_ROLES = ["admin", "owner", "staff"];
const ADMIN_MANAGE_ROLES = ["admin", "owner"];
const STAFF_POS_HOME_PATH = "/staff/orderpremade";

export const hasAdminDashboardAccess = (user) =>
  ADMIN_DASHBOARD_ROLES.includes((user?.role || "").toLowerCase());

export const canManageAdminDashboard = (user) =>
  ADMIN_MANAGE_ROLES.includes((user?.role || "").toLowerCase());

export const isStaffReadOnlyAdmin = (user) =>
  (user?.role || "").toLowerCase() === "staff";

export const canManageUsersAdmin = (user) =>
  (user?.role || "").toLowerCase() === "admin";

export const getPostLoginPath = (user) => {
  const role = (user?.role || "").toLowerCase();

  if (role === "staff") return STAFF_POS_HOME_PATH;
  if (role === "admin" || role === "owner") return "/admin";

  return "/";
};
