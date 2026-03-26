import { useState } from "react";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";

const MAX_GREETING_CHARS = 150;
const GREETING_CARD_PRICE = 5;

function OrderModal({ product, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [greetingCard, setGreetingCard] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");

  const subtotal = (product.price * quantity) + (greetingCard ? GREETING_CARD_PRICE : 0);

  const handleConfirm = () => {
    if (greetingCard && !greetingMessage.trim()) {
      alert("Please write a greeting card message or uncheck the greeting card option.");
      return;
    }
    onConfirm(product, quantity, greetingCard ? greetingMessage.trim() : null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Product Image */}
        <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
          <img
            src={`http://localhost:8000${product.image}`}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
          >
            ✕
          </button>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{product.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-rose-500">
                ₱{product.price}
              </span>
              <span className="text-sm text-gray-400">per bouquet</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Quantity</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 text-lg font-medium text-gray-600 transition hover:border-rose-400 hover:text-rose-500"
              >
                −
              </button>
              <span className="w-8 text-center text-xl font-semibold text-gray-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 text-lg font-medium text-gray-600 transition hover:border-rose-400 hover:text-rose-500"
              >
                +
              </button>
              <span className="ml-auto text-sm font-medium text-gray-500">
                Subtotal:{" "}
                <span className="text-gray-800 font-semibold">
                  ₱{subtotal.toLocaleString()}
                </span>
              </span>
            </div>
          </div>

          {/* Greeting Card */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Add a Greeting Card</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Include a personal message · <span className="text-rose-500 font-medium">+₱{GREETING_CARD_PRICE}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGreetingCard((prev) => !prev);
                  setGreetingMessage("");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  greetingCard ? "bg-rose-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    greetingCard ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {greetingCard && (
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-400">Your Message *</label>
                  <span className={`text-xs ${greetingMessage.length >= MAX_GREETING_CHARS ? "text-red-400" : "text-gray-400"}`}>
                    {greetingMessage.length}/{MAX_GREETING_CHARS}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={greetingMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_GREETING_CHARS) {
                      setGreetingMessage(e.target.value);
                    }
                  }}
                  placeholder="Write your heartfelt message here..."
                  maxLength={MAX_GREETING_CHARS}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
                {greetingMessage.length >= MAX_GREETING_CHARS && (
                  <p className="mt-1 text-xs text-red-400">Maximum character limit reached.</p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95"
          >
            Add to Cart — ₱{subtotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderPremadePage({ onBack }) {
  const { premades, loading } = useProducts();
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const availableProducts = premades.filter((p) => p.isAvailable);

  const handleConfirm = (product, quantity, greetingMessage) => {
    // Add ₱5 to the price if greeting card was selected
    const finalPrice = Number(product.price) + (greetingMessage ? GREETING_CARD_PRICE : 0);

    addToCart({
      ...product,
      price: finalPrice,
      greetingCard: greetingMessage || null,
    }, quantity);

    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 100);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-400 animate-pulse">Loading products...</p>
    </div>
  );

  return (
    <>
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirm}
        />
      )}

      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>

          <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
            Premade Bouquets
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {availableProducts.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={`http://localhost:8000${product.image}`}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {addedId === product.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-500 shadow">
                        ✓ Added!
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-bold text-rose-500">
                      ₱{product.price}
                    </span>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-lg bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600 active:scale-95"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderPremadePage;