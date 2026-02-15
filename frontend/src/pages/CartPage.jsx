import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-8">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
        <p className="text-sm text-gray-400">Go back and add some bouquets!</p>
        <button
          onClick={() => navigate("/order")}
          className="mt-2 rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Browse Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/order")}
              className="mb-1 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Order
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">Your Cart</h2>
            <p className="text-sm text-gray-400">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-gray-400 underline hover:text-red-400"
          >
            Clear all
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                  {item.type === "custom" && (
                    <span className="flex-shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-500">
                      Custom
                    </span>
                  )}
                </div>
                {/* Custom bouquet: show each flower on its own line */}
                {item.type === "custom" && item.items ? (
                  <ul className="mt-0.5 space-y-0.5">
                    {item.items.map((flower) => (
                      <li key={flower.id} className="text-xs text-gray-400">
                        {flower.name} ×{flower.quantity}
                        <span className="ml-1 text-gray-300">
                          — ₱{(flower.price * flower.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                )}
                <p className="mt-1 text-sm font-bold text-rose-500">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-rose-400 hover:text-rose-500 transition"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-gray-700">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-rose-400 hover:text-rose-500 transition"
                >
                  +
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-1 flex-shrink-0 text-gray-300 hover:text-red-400 transition text-lg leading-none"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Order Summary
          </h3>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-500">
                <span>{item.name} × {item.quantity}</span>
                <span>₱{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-3 text-base font-bold text-gray-800">
            <span>Total</span>
            <span className="text-rose-500">₱{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          className="mt-5 w-full rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-rose-600 active:scale-95"
          onClick={() => alert("Checkout coming soon!")}
        >
          Place Order — ₱{totalPrice.toLocaleString()}
        </button>

      </div>
    </div>
  );
}

export default CartPage;