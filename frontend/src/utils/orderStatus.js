const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  confirmed: "Confirmed",
};

export const normalizeOrderStatus = (status) => String(status || "").trim().toLowerCase();

export const formatOrderStatus = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);

  if (STATUS_LABELS[normalizedStatus]) {
    return STATUS_LABELS[normalizedStatus];
  }

  if (!normalizedStatus) {
    return "Unknown";
  }

  return normalizedStatus
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

export const getOrderStatusPillClasses = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);

  if (normalizedStatus === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
  if (normalizedStatus === "processing" || normalizedStatus === "confirmed") return "bg-blue-100 text-blue-700 border-blue-200";
  if (normalizedStatus === "shipped") return "bg-purple-100 text-purple-700 border-purple-200";
  if (normalizedStatus === "delivered" || normalizedStatus === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (normalizedStatus === "cancelled") return "bg-rose-100 text-rose-700 border-rose-200";

  return "bg-gray-100 text-gray-600 border-gray-200";
};

export const isActionRequiredOrderStatus = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);
  return normalizedStatus === "pending" || normalizedStatus === "processing";
};
