/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { ShoppingCart, Trash2 } from "lucide-react";

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  const handleConfirmOrder = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-8">
        <ShoppingCart className="h-16 w-16 text-[#3F5AE0]" strokeWidth={1.5} />
        <h2 className="text-xl font-semibold text-gray-700">
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-400">
          Go back and add some bouquets!
        </p>
        <button
          onClick={() => navigate("/order")}
          className="mt-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Top */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/order")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Continue Shopping
          </button>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* LEFT SIDE – CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-5 border-b border-gray-200 pb-6"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-28 flex-shrink-0 rounded-xl object-cover bg-gray-100"
                />

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      ₱{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 text-gray-600 hover:text-blue-600"
                      >
                        −
                      </button>
                      <span className="px-3 text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 text-gray-600 hover:text-blue-600"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 transition hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right font-semibold text-blue-600">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE – ORDER DETAILS */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-gray-100 p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-semibold text-gray-800">
                Order Details
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Merchandise</span>
                  <span>₱{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₱0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco Fee</span>
                  <span>₱0.00</span>
                </div>
              </div>

              <div className="mt-5 flex justify-between border-t pt-4 text-base font-bold text-gray-800">
                <span>Total</span>
                <span className="text-blue-600">
                  ₱{totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-[#3F5AE0] py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
                onClick={handleConfirmOrder}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;