import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminOrdersPage from "./AdminOrdersPage";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../components/orders/OrderStatusLegend", () => ({
  default: () => <div>Order status legend</div>,
}));

vi.mock("../../utils/lookups", async () => {
  const actual = await vi.importActual("../../utils/lookups");

  return {
    ...actual,
    fetchLookups: vi.fn().mockResolvedValue({
      order_statuses: [
        { code: "pending", label: "Pending", colors: { background: "#fff", border: "#ddd", text: "#111" } },
      ],
    }),
  };
});

vi.mock("../../utils/assetUrl", () => ({
  getAssetUrl: (value) => value,
}));

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockImplementation((path) => {
      if (path === "/orders") {
        return Promise.resolve({
          data: [
            {
              order_id: "ORD-1001",
              user_id: 7,
              order_status: "pending",
              delivery_method: "pickup",
              total_amount: 1200,
              created_at: "2026-05-22T08:00:00.000Z",
              isArchived: false,
              address: "Pickup",
              schedule: {
                schedule_name: "Mother's Day Drop",
                event_date: "2026-05-30T00:00:00.000Z",
              },
              user: {
                id: 7,
                first_name: "Jamie",
                last_name: "Customer",
                email: "jamie@example.com",
                phone_number: "09123456789",
                priority: 0,
              },
              payment: {
                payment_id: "PAY-1001",
                payment_method: "GCash",
                reference_number: "REF12345",
                payment_date: "2026-05-22T08:00:00.000Z",
                reference_image_path: "/storage/payments/proof.jpg",
              },
              order_items: [
                {
                  product_id: 101,
                  product_name: "Blush Bouquet",
                  quantity: 2,
                  price_at_purchase: 600,
                  special_message: "Happy anniversary",
                },
              ],
            },
          ],
        });
      }

      if (path === "/pos-transactions") {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });
  });

  it("opens ordered items in a dedicated preorder modal while keeping payment details available", async () => {
    const user = userEvent.setup();

    render(<AdminOrdersPage user={{ role: "admin" }} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/orders");
    });

    await user.click(screen.getAllByText("#ORD-1001")[0]);

    expect(screen.getByText("Manage Order Status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /payment record/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /items ordered/i })).toBeInTheDocument();
    expect(screen.queryByText("Blush Bouquet")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /items ordered/i }));

    const itemsModal = screen.getByRole("dialog", { name: /items ordered/i });
    expect(within(itemsModal).getByText("Blush Bouquet")).toBeInTheDocument();
    expect(within(itemsModal).getByText("Order Total")).toBeInTheDocument();
    expect(within(itemsModal).getByText("Happy anniversary", { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /payment record/i }));

    expect(screen.getByText("Payment Details")).toBeInTheDocument();
    expect(screen.getByText("REF12345")).toBeInTheDocument();
  });
});
