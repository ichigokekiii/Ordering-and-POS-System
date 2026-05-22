import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "./CheckoutPage";
import api from "../../services/api";

const mockNavigate = vi.fn();
const mockClearCart = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../contexts/CartContext", () => ({
  useCart: () => ({
    cartItems: [
      {
        id: "premade-1",
        _productId: 101,
        name: "Blush Bouquet",
        price: 600,
        quantity: 2,
        greetingCard: "Happy anniversary",
      },
    ],
    totalPrice: 1200,
    clearCart: mockClearCart,
    selectedScheduleId: 99,
  }),
}));

vi.mock("../../contexts/ScheduleContext", () => ({
  useSchedules: () => ({
    schedules: [{ id: 99, schedule_name: "Mother's Day Drop", event_date: "2026-05-30" }],
  }),
}));

vi.mock("../../contexts/ContentContext", () => ({
  useContents: () => ({
    contents: [],
  }),
}));

vi.mock("../../components/TermsAndConditionsModal", () => ({
  default: ({ open, onAcknowledge }) =>
    open ? (
      <button type="button" onClick={onAcknowledge}>
        Acknowledge terms
      </button>
    ) : null,
}));

vi.mock("../../components/TermsConsentField", () => ({
  default: ({ checked, onOpen }) => (
    <button type="button" onClick={onOpen}>
      {checked ? "Terms accepted" : "Open terms"}
    </button>
  ),
}));

vi.mock("../../components/privacy/DataPrivacyNotice", () => ({
  default: ({ checked, onToggle }) => (
    <button type="button" onClick={() => onToggle(!checked)}>
      {checked ? "Privacy accepted" : "Accept privacy"}
    </button>
  ),
}));

vi.mock("../../components/form/FormFieldHeader", () => ({
  default: ({ label }) => <span>{label}</span>,
}));

vi.mock("../../utils/lookups", async () => {
  const actual = await vi.importActual("../../utils/lookups");

  return {
    ...actual,
    fetchLookups: vi.fn().mockResolvedValue({
      delivery_options: actual.FALLBACK_DELIVERY_OPTIONS,
      delivery_zones: actual.FALLBACK_DELIVERY_ZONES,
    }),
  };
});

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => "blob:preview");

    api.get.mockResolvedValue({
      data: {
        id: 7,
        first_name: "Jamie",
        last_name: "Customer",
        email: "jamie@example.com",
        phone_number: "09123456789",
        role: "user",
        addresses: [],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits checkout items in the initial order request and does not call the legacy order-items endpoint", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValue({
      data: {
        order_id: "ORD-TEST-1",
        payment_id: "PAY-TEST-1",
        item_count: 1,
      },
    });

    const { container } = render(<CheckoutPage />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/profile");
    });

    await user.selectOptions(screen.getByRole("combobox"), "GCash");
    await user.type(screen.getByPlaceholderText("Transaction reference code"), "REF12345");

    const fileInput = container.querySelector('input[type="file"]');
    const paymentProof = new File(["proof"], "proof.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, paymentProof);

    await user.click(screen.getByRole("button", { name: "Accept privacy" }));
    await user.click(screen.getByRole("button", { name: "Open terms" }));
    await user.click(screen.getByRole("button", { name: "Acknowledge terms" }));
    await user.click(screen.getByRole("button", { name: "Confirm Order" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    const [endpoint, payload] = api.post.mock.calls[0];

    expect(endpoint).toBe("/orders");
    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("reference_number")).toBe("REF12345");

    const submittedItems = JSON.parse(payload.get("items"));

    expect(submittedItems).toEqual([
      expect.objectContaining({
        product_id: 101,
        product_name: "Blush Bouquet",
        quantity: 2,
        price_at_purchase: 1200,
        special_message: "Happy anniversary",
      }),
    ]);

    expect(api.post).not.toHaveBeenCalledWith("/order-items", expect.anything());
    expect(mockClearCart).toHaveBeenCalledWith(99);
  });
});
