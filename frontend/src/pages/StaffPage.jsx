import React, { useState } from "react";
import StaffNavbar from "../components/StaffNavbar";


// --- Static Data ---
const PRODUCTS = [
  { id: "main", name: "Main Flower", price: 100 },
  { id: "filler", name: "Fillers", price: 20 },
];

// --- Icons (Standard SVGs) ---
const IconCart = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);
const IconTrash = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const IconPlus = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconMinus = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function PosPage({ user, onLogout }) { 
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add item
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Update Quantity
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, qty: Math.max(0, item.qty + delta) };
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    );
  };

  const clearCart = () => setCart([]);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // --- Checkout Logic (Using Native Fetch) ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsLoading(true);

    const payload = {
      items: cart,
      total_amount: total,
    };

    try {
      // Using built-in fetch instead of Axios
      const response = await fetch("http://localhost:8000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Success
      alert("Sale Recorded Successfully (Saved to DB)!");
      clearCart();
    } catch (error) {
      // FIX: We now use 'error' here so the linter is happy
      console.warn("Backend not found, using DEMO mode. Error details:", error);

      // Fallback for demo purposes
      setTimeout(() => {
        alert(
          `DEMO MODE: Sale of ₱${total} would be recorded.\n(Backend connection failed, but UI works!)`,
        );
        clearCart();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-50 p-6 font-sans text-gray-800">
        <StaffNavbar user={user} onLogout={onLogout} />

      <div className="p-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Product List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Products</h2>
          <div className="grid gap-4">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-pink-100 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-pink-600">
                    ₱{product.price}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full shadow-lg shadow-pink-200 transition"
                >
                  <IconPlus className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Cart</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 flex items-center gap-1 text-sm hover:underline"
              >
                <IconTrash className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No items in cart</p>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">₱{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                    >
                      <IconMinus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 shadow-md shadow-pink-200"
                    >
                      <IconPlus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-gray-900 w-16 text-right">
                      ₱{item.price * item.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl text-gray-600">Total:</span>
              <span className="text-3xl font-bold text-pink-600">₱{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isLoading || cart.length === 0}
              className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-xl ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200"}`}
            >
              {isLoading ? "Processing..." : "Record Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
