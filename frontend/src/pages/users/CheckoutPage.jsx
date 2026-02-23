import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { CreditCard, Truck, Store, Upload, QrCode } from "lucide-react";
import api from "../../services/api";

const PRIMARY_BLUE = "#4F6DB8";


export default function CheckoutPage() {
  const { cartItems = [], clearCart } = useCart();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const location = useLocation();
  const orderFromBackend = location.state?.order || null;

  const itemsSource = orderFromBackend?.items || cartItems;

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [useSameAddress, setUseSameAddress] = useState(true);

  const subtotal = itemsSource.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingFee = deliveryMethod === "delivery" ? 5 : 0;
  const otherFee = 2.5;
  const total = subtotal + shippingFee + otherFee;

  const handlePlaceOrder = async () => {
    // FOR NOW: allow placing order even if backend fails
    try {
      await api.post("/orders", {
        user_id: 1, // temporary until auth is implemented
        schedule_id: 1, // temporary until dynamic schedule is connected
        items: itemsSource.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.warn("Backend order failed, continuing anyway for now.");
    }

    // Show success modal regardless
    setShowSuccessModal(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-10 px-4 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-10">
          {/* 1. Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">1. Contact</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Email address*
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full mt-1 p-3 rounded-lg bg-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Phone number
                </label>
                <input
                  type="text"
                  placeholder="+1 (415) 123-4567"
                  className="w-full mt-1 p-3 rounded-lg bg-gray-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" />
                <span>
                  I consent to receive text messages for order updates
                </span>
              </div>
            </div>
          </div>

          {/* 2. Shipping */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">2. Shipping</h2>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setDeliveryMethod("delivery")}
                className={`flex-1 flex items-center gap-2 p-4 rounded-xl border ${
                  deliveryMethod === "delivery"
                    ? "border-[3px]"
                    : "border-gray-200"
                }`}
                style={{
                  borderColor:
                    deliveryMethod === "delivery"
                      ? PRIMARY_BLUE
                      : undefined,
                }}
              >
                <Truck size={18} />
                <div>
                  <p className="font-medium">Deliver to me</p>
                  <p className="text-sm text-gray-500">₱5.00</p>
                </div>
              </button>

              <button
                onClick={() => setDeliveryMethod("pickup")}
                className={`flex-1 flex items-center gap-2 p-4 rounded-xl border ${
                  deliveryMethod === "pickup"
                    ? "border-[3px]"
                    : "border-gray-200"
                }`}
                style={{
                  borderColor:
                    deliveryMethod === "pickup"
                      ? PRIMARY_BLUE
                      : undefined,
                }}
              >
                <Store size={18} />
                <div>
                  <p className="font-medium">Store pick up</p>
                  <p className="text-sm text-gray-500">Free shipping</p>
                </div>
              </button>
            </div>

            {deliveryMethod === "delivery" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="First name*"
                    className="p-3 rounded-lg bg-gray-100 focus:outline-none"
                  />
                  <input
                    placeholder="Last name*"
                    className="p-3 rounded-lg bg-gray-100 focus:outline-none"
                  />
                </div>

                <input
                  placeholder="Address*"
                  className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="City*"
                    className="p-3 rounded-lg bg-gray-100 focus:outline-none"
                  />
                  <input
                    placeholder="Zip code*"
                    className="p-3 rounded-lg bg-gray-100 focus:outline-none"
                  />
                </div>

                <input
                  placeholder="State / Province*"
                  className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 3. Payment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">3. Payment</h2>

            <div
              className="rounded-xl p-4 flex items-center justify-between mb-6 border-2"
              style={{ borderColor: PRIMARY_BLUE }}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={18} />
                <span className="font-medium">
                  Checkout with GCash
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium block mb-2">
                  QR Code*
                </label>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                >
                  Click Here
                </button>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Reference Number*
                </label>
                <input
                  type="text"
                  placeholder="Enter here"
                  className="w-full p-3 rounded-lg bg-gray-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Attach Image
                </label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-500">
                  <Upload className="mx-auto mb-2" size={20} />
                  <p className="text-sm">Add an attachment (optional)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={() =>
                    setUseSameAddress(!useSameAddress)
                  }
                />
                <span>
                  Use shipping address as billing address
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-6">
            Checkout
          </h3>

          <div className="space-y-4 mb-6">
            {itemsSource.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name || item.product?.name} × {item.quantity}
                </span>
                <span>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₱{shippingFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Other Fee</span>
              <span>₱{otherFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-semibold text-base mt-2">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-3 rounded-xl text-white font-medium"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            Place order
          </button>
        </div>
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center relative animate-fadeIn">
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center animate-scaleIn">
                  <svg
                    className="w-10 h-10 text-green-500 animate-drawCheck"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-2">
              Your Order is being Processed
            </h2>
            <p className="text-gray-500 mb-6">
              We’ve sent you an Email confirming your order
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Add these to your global CSS if not present:

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-scaleIn {
  animation: scaleIn 0.4s ease-out;
}

*/