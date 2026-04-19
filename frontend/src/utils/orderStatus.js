const FALLBACK_ORDER_STATUSES = [
  {
    code: "pending",
    label: "Pending",
    description: "Waiting for order review and confirmation.",
    colors: {
      background: "#fef3c7",
      border: "#fcd34d",
      text: "#92400e",
    },
  },
  {
    code: "processing",
    label: "Processing",
    description: "Order is confirmed and being prepared.",
    colors: {
      background: "#dbeafe",
      border: "#93c5fd",
      text: "#1d4ed8",
    },
  },
  {
    code: "shipped",
    label: "Shipped",
    description: "Order is in transit to the customer.",
    colors: {
      background: "#ede9fe",
      border: "#c4b5fd",
      text: "#6d28d9",
    },
  },
  {
    code: "delivered",
    label: "Delivered",
    description: "Order has been completed and received.",
    colors: {
      background: "#d1fae5",
      border: "#86efac",
      text: "#047857",
    },
  },
  {
    code: "cancelled",
    label: "Cancelled",
    description: "Order was cancelled before fulfillment.",
    colors: {
      background: "#fee2e2",
      border: "#fca5a5",
      text: "#b91c1c",
    },
  },
];

const ORDER_STATUS_ALIASES = {
  confirmed: "processing",
  completed: "delivered",
  canceled: "cancelled",
};

export const getFallbackOrderStatuses = () => FALLBACK_ORDER_STATUSES;

export const normalizeOrderStatus = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  return ORDER_STATUS_ALIASES[normalizedStatus] || normalizedStatus;
};

export const resolveOrderStatuses = (statuses = []) => (
  Array.isArray(statuses) && statuses.length > 0 ? statuses : FALLBACK_ORDER_STATUSES
);

export const getOrderStatusMeta = (status, statuses = []) => {
  const normalizedStatus = normalizeOrderStatus(status);
  const source = resolveOrderStatuses(statuses);
  const matched = source.find((item) => item.code === normalizedStatus);

  if (matched) {
    return matched;
  }

  if (!normalizedStatus) {
    return {
      code: "unknown",
      label: "Unknown",
      description: "Status is unavailable.",
      colors: {
        background: "#f3f4f6",
        border: "#d1d5db",
        text: "#4b5563",
      },
    };
  }

  return {
    code: normalizedStatus,
    label: normalizedStatus
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" "),
    description: "",
    colors: {
      background: "#f3f4f6",
      border: "#d1d5db",
      text: "#4b5563",
    },
  };
};

export const formatOrderStatus = (status, statuses = []) => (
  getOrderStatusMeta(status, statuses).label
);

export const getOrderStatusPillStyle = (status, statuses = []) => {
  const meta = getOrderStatusMeta(status, statuses);

  return {
    backgroundColor: meta.colors.background,
    borderColor: meta.colors.border,
    color: meta.colors.text,
  };
};

export const getOrderStatusLegend = (statuses = []) => resolveOrderStatuses(statuses);

export const isActionRequiredOrderStatus = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);
  return normalizedStatus === "pending" || normalizedStatus === "processing";
};
