import api from "../services/api";
import { getFallbackOrderStatuses } from "./orderStatus";

export const FALLBACK_DELIVERY_OPTIONS = [
  {
    code: "pickup",
    label: "Pickup",
    description: "Customer will collect the order from the shop.",
  },
  {
    code: "delivery",
    label: "Delivery",
    description: "Order will be sent through a courier or delivery partner.",
  },
];

export const FALLBACK_DELIVERY_ZONES = [
  {
    code: "southern_luzon",
    label: "Southern Luzon",
    description: "Primary service coverage area.",
    requires_other_details: false,
  },
  {
    code: "other",
    label: "Other",
    description: "Use this when the destination needs a manual location note.",
    requires_other_details: true,
  },
];

export const getFallbackLookups = () => ({
  order_statuses: getFallbackOrderStatuses(),
  delivery_options: FALLBACK_DELIVERY_OPTIONS,
  delivery_zones: FALLBACK_DELIVERY_ZONES,
});

export const fetchLookups = async () => {
  try {
    const { data } = await api.get("/lookups");
    return {
      ...getFallbackLookups(),
      ...(data || {}),
    };
  } catch (error) {
    console.error("Failed to load lookups:", error?.response?.data || error?.message || error);
    return getFallbackLookups();
  }
};
