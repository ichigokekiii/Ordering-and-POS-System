import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus, Search, X } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";
import { useSchedules } from "../../contexts/ScheduleContext";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import {
  GREETING_CARD_MAX_LENGTH,
  validateGreetingCardMessage,
} from "../../utils/authValidation";

const GREETING_CARD_PRICE = 5;

function OrderModal({ product, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [greetingCard, setGreetingCard] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");
  const [greetingError, setGreetingError] = useState("");

  const subtotal = product.price * quantity + (greetingCard ? GREETING_CARD_PRICE : 0);

  const handleConfirm = () => {
    if (greetingCard) {
      const nextGreetingError = validateGreetingCardMessage(greetingMessage);
      setGreetingError(nextGreetingError);
      if (nextGreetingError) {
        return;
      }
    }

    onConfirm(product, quantity, greetingCard ? greetingMessage.trim() : null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-64 items-center justify-center border-b border-gray-100 bg-gray-50/40 p-8">
          <img
            src={`http://localhost:8000${product.image}`}
            alt={product.name}
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-playfair font-bold text-gray-900">
              {product.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {product.description}
            </p>
            <p className="mt-4 text-2xl font-bold text-[#4f6fa5]">
              ₱{Number(product.price).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Quantity
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:text-[#4f6fa5]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:text-[#4f6fa5]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                ₱{subtotal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">Greeting card</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add a personal message for ₱{GREETING_CARD_PRICE}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGreetingCard((prev) => !prev);
                  if (greetingCard) {
                    setGreetingMessage("");
                  }
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  greetingCard ? "bg-[#4f6fa5]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    greetingCard ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {greetingCard && (
              <div className="mt-5">
                <div className="mb-2 flex justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                    Your message
                  </label>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {greetingMessage.length}/{GREETING_CARD_MAX_LENGTH}
                  </span>
                </div>
                <FormFieldHeader label="Greeting Card Message" required error={greetingError} className="mb-2" />
                <textarea
                  rows={3}
                  value={greetingMessage}
                  onChange={(e) => {
                    setGreetingMessage(e.target.value.slice(0, GREETING_CARD_MAX_LENGTH));
                    setGreetingError("");
                  }}
                  maxLength={GREETING_CARD_MAX_LENGTH}
                  className={getValidationInputClassName({
                    hasError: !!greetingError,
                    baseClassName:
                      "w-full resize-none rounded-2xl border px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2",
                    validClassName: "border-gray-200 bg-gray-50 focus:border-[#4f6fa5] focus:ring-[#4f6fa5]/15",
                    invalidClassName: "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100",
                  })}
                  placeholder="Write your heartfelt message here..."
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-full bg-gray-900 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#4f6fa5]"
          >
            Add to Cart · ₱{subtotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderPremadePage() {
  const navigate = useNavigate();
  const { premades, loading } = useProducts();
  const { addToCart, selectedScheduleId } = useCart();
  const { schedules } = useSchedules();
  const { searchTerm = "", setSearchTerm } = useOutletContext() || {};
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Roses", "Lilies", "Tulips", "Carnation", "Mixed"];
  const availableProducts = premades.filter((product) => !product.isArchived && product.isAvailable);

  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      (product.category && product.category.toLowerCase() === activeCategory.toLowerCase()) ||
      (product.type && product.type.toLowerCase() === activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleConfirm = (product, quantity, greetingMessage) => {
    const finalPrice = Number(product.price) + (greetingMessage ? GREETING_CARD_PRICE : 0);

    addToCart(
      {
        ...product,
        price: finalPrice,
        greetingCard: greetingMessage || null,
      },
      quantity
    );

    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 800);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf9]">
        <p className="animate-pulse text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <>
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirm}
        />
      )}

      <div className="min-h-screen bg-[#fcfaf9] px-6 pb-24 pt-10 md:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col gap-6 border-b border-gray-100 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/order")}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#4f6fa5]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to order options
              </button>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#4f6fa5]">
                Our Collection
              </p>
              <h1 className="text-4xl font-playfair font-bold text-gray-900 md:text-5xl">
                Premade Bouquets
              </h1>
              {selectedSchedule && (
                <p className="mt-3 text-sm text-gray-500">
                  For <span className="font-semibold text-gray-900">{selectedSchedule.schedule_name}</span>
                </p>
              )}
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-gray-500">
              Browse the ready-made collection, filter by category, and use the
              shared search above when you want to narrow the list even more.
            </p>
          </div>

          <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeCategory === category
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <Search className="h-4 w-4" />
                {searchTerm ? `Filtering by "${searchTerm}"` : "Showing all available bouquets"}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center text-gray-500">
                <Search className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                <p className="text-lg font-playfair">
                  No premade bouquets found matching your criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (setSearchTerm) {
                      setSearchTerm("");
                    }
                    setActiveCategory("All");
                  }}
                  className="mt-4 font-semibold text-[#4f6fa5] hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="group relative flex min-h-[430px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative flex h-64 items-center justify-center border-b border-gray-100 bg-gray-50/40 p-8">
                      <img
                        src={`http://localhost:8000${product.image}`}
                        alt={product.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {addedId === product.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#4f6fa5] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                            <Check className="h-4 w-4" />
                            Added
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                      <div>
                        <h3 className="line-clamp-1 text-xl font-playfair font-bold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="mt-2 min-h-[2.5rem] text-xs font-semibold uppercase tracking-widest text-gray-400">
                          {product.description || "Floral arrangement"}
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                            Price
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#4f6fa5]">
                            ₱{Number(product.price).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900">
                          Order now
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderPremadePage;
