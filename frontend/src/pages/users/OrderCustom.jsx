import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";

const MAX_GREETING_CHARS = 150;
const GREETING_CARD_PRICE = 5;

function QuantityCard({
  product,
  quantity,
  onDecrease,
  onIncrease,
  disabledIncrease = false,
  subtitle,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-sm">
      <div className="flex h-52 items-center justify-center border-b border-gray-100 bg-gray-50/40 p-6">
        <img
          src={`http://localhost:8000${product.image}`}
          alt={product.name}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="text-center">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {product.name}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#4f6fa5]">
              {subtitle}
            </p>
          )}
        </div>
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
          <button
            type="button"
            onClick={() => onDecrease(product.id)}
            disabled={quantity === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-[#4f6fa5] disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-sm font-bold text-gray-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrease(product.id)}
            disabled={disabledIncrease}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-[#4f6fa5] disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BouquetCard({ product, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 ${
        isSelected
          ? "border-[#4f6fa5] shadow-md ring-2 ring-[#4f6fa5]/10"
          : "border-gray-200 hover:shadow-sm"
      }`}
    >
      <div className="relative flex h-56 items-center justify-center border-b border-gray-100 bg-gray-50/40 p-6">
        <img
          src={`http://localhost:8000${product.image}`}
          alt={product.name}
          className="h-full w-full object-contain"
        />
        {isSelected && (
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#4f6fa5] text-white shadow-sm">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="truncate text-lg font-playfair font-bold text-gray-900">
          {product.name}
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Requires {Number(product.required_main_count ?? 1)} main,{" "}
          {Number(product.required_filler_count ?? 2)} filler
        </p>
        <p className="text-lg font-bold text-[#4f6fa5]">
          ₱{Number(product.price).toLocaleString()}
        </p>
      </div>
    </button>
  );
}

function OrderCustom() {
  const navigate = useNavigate();
  const { searchTerm = "" } = useOutletContext() || {};
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [mainCounts, setMainCounts] = useState({});
  const [fillerCounts, setFillerCounts] = useState({});
  const [additionalCounts, setAdditionalCounts] = useState({});
  const [greetingCard, setGreetingCard] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");
  const [added, setAdded] = useState(false);

  const availableProducts = products.filter((product) => product.isAvailable);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch = (product) =>
    !normalizedSearch ||
    product.name.toLowerCase().includes(normalizedSearch) ||
    (product.category || "").toLowerCase().includes(normalizedSearch) ||
    (product.type || "").toLowerCase().includes(normalizedSearch);

  const bouquets = availableProducts.filter(
    (product) => product.category === "Bouquets" && matchesSearch(product)
  );
  const mainFlowers = availableProducts.filter(
    (product) =>
      product.category === "Additional" &&
      product.type === "Main Flowers" &&
      matchesSearch(product)
  );
  const fillers = availableProducts.filter(
    (product) =>
      product.category === "Additional" &&
      product.type === "Fillers" &&
      matchesSearch(product)
  );
  const addOns = availableProducts.filter(
    (product) =>
      product.category === "Additional" &&
      (product.type === "Main Flowers" || product.type === "Fillers") &&
      matchesSearch(product)
  );

  const requiredMainCount = Number(selectedBouquet?.required_main_count ?? 1);
  const requiredFillerCount = Number(selectedBouquet?.required_filler_count ?? 2);
  const totalMains = Object.values(mainCounts).reduce((sum, qty) => sum + qty, 0);
  const totalFillers = Object.values(fillerCounts).reduce((sum, qty) => sum + qty, 0);

  const selectedMains = availableProducts
    .filter((product) => (mainCounts[product.id] || 0) > 0)
    .map((product) => ({ ...product, quantity: mainCounts[product.id] }));
  const selectedFillers = availableProducts
    .filter((product) => (fillerCounts[product.id] || 0) > 0)
    .map((product) => ({ ...product, quantity: fillerCounts[product.id] }));
  const selectedAddOns = availableProducts
    .filter((product) => (additionalCounts[product.id] || 0) > 0)
    .map((product) => ({ ...product, quantity: additionalCounts[product.id] }));

  const basePrice = Number(selectedBouquet?.price || 0);
  const addOnTotal = selectedAddOns.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const greetingTotal = greetingCard ? GREETING_CARD_PRICE : 0;
  const totalPrice = basePrice + addOnTotal + greetingTotal;

  const canAddToCart =
    selectedBouquet &&
    totalMains === requiredMainCount &&
    totalFillers === requiredFillerCount &&
    (!greetingCard || greetingMessage.trim());

  const updateCounter = (setter, id, value) => {
    setter((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const handleBouquetSelect = (product) => {
    const isSameBouquet = selectedBouquet?.id === product.id;
    setSelectedBouquet(isSameBouquet ? null : product);
    setMainCounts({});
    setFillerCounts({});
    setAdditionalCounts({});
    setGreetingCard(false);
    setGreetingMessage("");
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const items = [
      { ...selectedBouquet, quantity: 1 },
      ...selectedMains.map((item) => ({ ...item, free: true })),
      ...selectedFillers.map((item) => ({ ...item, free: true })),
      ...selectedAddOns,
    ];

    addToCart(
      {
        id: `custom-${Date.now()}`,
        type: "custom",
        name: "Custom Bouquet",
        description: [
          selectedBouquet.name,
          ...selectedMains.map((item) => `${item.name} ×${item.quantity}`),
          ...selectedFillers.map((item) => `${item.name} ×${item.quantity}`),
          ...selectedAddOns.map((item) => `${item.name} ×${item.quantity}`),
        ].join(", "),
        price: totalPrice,
        image: selectedBouquet.image,
        items,
        greetingCard: greetingCard ? greetingMessage.trim() : null,
      },
      1
    );

    setAdded(true);
    window.setTimeout(() => {
      navigate("/cart");
    }, 700);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf9]">
        <p className="animate-pulse text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf9] px-6 pb-32 pt-10 md:px-12">
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
              Make it yours
            </p>
            <h1 className="text-4xl font-playfair font-bold text-gray-900 md:text-5xl">
              Custom Bouquet Builder
            </h1>
          </div>
          <div className="max-w-lg">
            <p className="text-sm leading-relaxed text-gray-500">
              Choose a bouquet wrapper, complete the required flowers, then add
              extras and a personal message before sending it to your cart.
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {searchTerm ? `Filtering by "${searchTerm}"` : "Showing all available options"}
            </p>
          </div>
        </div>

        <div className="mb-12 flex flex-wrap gap-2 border-b border-gray-100 pb-6">
          {[
            "1. Bouquet",
            "2. Main Flowers",
            "3. Fillers",
            "4. Add-ons",
            "5. Personal Touch",
          ].map((step) => (
            <span
              key={step}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500"
            >
              {step}
            </span>
          ))}
        </div>

        <div className="space-y-14">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-playfair font-bold text-gray-900">
                Bouquet Wrapper
              </h2>
              {selectedBouquet && (
                <span className="rounded-full bg-[#4f6fa5]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#4f6fa5]">
                  Selected
                </span>
              )}
            </div>
            {bouquets.length === 0 ? (
              <p className="py-12 text-gray-400">No bouquets match the current search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {bouquets.map((product) => (
                  <BouquetCard
                    key={product.id}
                    product={product}
                    isSelected={selectedBouquet?.id === product.id}
                    onSelect={handleBouquetSelect}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={!selectedBouquet ? "pointer-events-none opacity-45" : ""}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900">
                  Main Flowers
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {requiredMainCount} required
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {totalMains}/{requiredMainCount}
              </span>
            </div>
            {mainFlowers.length === 0 ? (
              <p className="py-12 text-gray-400">No main flowers match the current search.</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {mainFlowers.map((product) => (
                  <QuantityCard
                    key={product.id}
                    product={product}
                    quantity={mainCounts[product.id] || 0}
                    onDecrease={(id) => updateCounter(setMainCounts, id, (mainCounts[id] || 0) - 1)}
                    onIncrease={(id) => {
                      if (totalMains >= requiredMainCount && (mainCounts[id] || 0) === 0) return;
                      updateCounter(setMainCounts, id, (mainCounts[id] || 0) + 1);
                    }}
                    disabledIncrease={totalMains >= requiredMainCount && (mainCounts[product.id] || 0) === 0}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            className={
              !selectedBouquet || totalMains !== requiredMainCount
                ? "pointer-events-none opacity-45"
                : ""
            }
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900">
                  Fillers
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {requiredFillerCount} required
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {totalFillers}/{requiredFillerCount}
              </span>
            </div>
            {fillers.length === 0 ? (
              <p className="py-12 text-gray-400">No fillers match the current search.</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {fillers.map((product) => (
                  <QuantityCard
                    key={product.id}
                    product={product}
                    quantity={fillerCounts[product.id] || 0}
                    onDecrease={(id) => updateCounter(setFillerCounts, id, (fillerCounts[id] || 0) - 1)}
                    onIncrease={(id) => {
                      if (totalFillers >= requiredFillerCount && (fillerCounts[id] || 0) === 0) return;
                      updateCounter(setFillerCounts, id, (fillerCounts[id] || 0) + 1);
                    }}
                    disabledIncrease={totalFillers >= requiredFillerCount && (fillerCounts[product.id] || 0) === 0}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            className={
              !selectedBouquet ||
              totalMains !== requiredMainCount ||
              totalFillers !== requiredFillerCount
                ? "pointer-events-none opacity-45"
                : ""
            }
          >
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#4f6fa5]">
                Current Base Build
              </p>
              <p className="text-sm text-gray-700">
                {selectedBouquet
                  ? [
                      selectedBouquet.name,
                      ...selectedMains.map((item) => `${item.name} ×${item.quantity}`),
                      ...selectedFillers.map((item) => `${item.name} ×${item.quantity}`),
                    ].join(" + ")
                  : "Select a bouquet to begin."}
              </p>
              <p className="mt-3 text-base font-semibold text-gray-900">
                Base price: ₱{basePrice.toLocaleString()}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-3xl font-playfair font-bold text-gray-900">
                Add-ons
              </h2>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Optional extras
              </p>
            </div>
            {addOns.length === 0 ? (
              <p className="py-12 text-gray-400">No add-ons match the current search.</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {addOns.map((product) => (
                  <QuantityCard
                    key={product.id}
                    product={product}
                    quantity={additionalCounts[product.id] || 0}
                    onDecrease={(id) => updateCounter(setAdditionalCounts, id, (additionalCounts[id] || 0) - 1)}
                    onIncrease={(id) => updateCounter(setAdditionalCounts, id, (additionalCounts[id] || 0) + 1)}
                    subtitle={`+₱${Number(product.price).toLocaleString()}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            className={
              !selectedBouquet ||
              totalMains !== requiredMainCount ||
              totalFillers !== requiredFillerCount
                ? "pointer-events-none opacity-45"
                : ""
            }
          >
            <div className="mb-6">
              <h2 className="text-3xl font-playfair font-bold text-gray-900">
                Personal Touch
              </h2>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Add a greeting card
              </p>
            </div>

            <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Greeting card</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Include a personal message for an additional ₱{GREETING_CARD_PRICE}.
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
                <div className="mt-6">
                  <div className="mb-2 flex justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                      Your message
                    </label>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {greetingMessage.length}/{MAX_GREETING_CHARS}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={greetingMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_GREETING_CHARS) {
                        setGreetingMessage(e.target.value);
                      }
                    }}
                    placeholder="Write your heartfelt message here..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#4f6fa5]/15"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <div
          className={`fixed bottom-8 left-1/2 z-50 w-[92%] -translate-x-1/2 md:w-auto ${
            selectedBouquet ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex min-w-0 items-center justify-between gap-5 rounded-[28px] bg-gray-900 px-6 py-4 text-white shadow-2xl md:min-w-[560px]">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                {canAddToCart ? "Ready to add" : "Complete required selections"}
              </p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="truncate text-lg font-playfair font-bold">
                  {selectedBouquet?.name || "Custom Bouquet"}
                </p>
                <p className="text-xl font-bold">₱{totalPrice.toLocaleString()}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart || added}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : canAddToCart
                    ? "bg-white text-gray-900 hover:bg-[#4f6fa5] hover:text-white"
                    : "cursor-not-allowed bg-white/10 text-white/60"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? "Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCustom;
