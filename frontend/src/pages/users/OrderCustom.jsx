/* eslint-disable react-hooks/purity */
import { useState } from "react";
import { useProducts } from "../../contexts/ProductContext";

function OrderCustom({ onBack, onNext }) {
  const { products, loading } = useProducts();

  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [fillerCounts, setFillerCounts] = useState({});

  const availableProducts = products.filter((p) => p.isAvailable);
  const bouquets = availableProducts.filter((p) => p.category === "Bouquets");
  const fillers = availableProducts.filter((p) => p.category === "Additional" && p.type === "Fillers");

  // Total filler quantity selected
  const totalFillers = Object.values(fillerCounts).reduce((sum, q) => sum + q, 0);

  const increaseFiller = (id) => {
    if (totalFillers >= 2) return; // strict max of 2
    setFillerCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decreaseFiller = (id) => {
    setFillerCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  const canProceed = selectedBouquet && totalFillers === 2;

  const handleNext = () => {
    const selectedFillers = fillers
      .filter((p) => (fillerCounts[p.id] || 0) > 0)
      .map((p) => ({ ...p, quantity: fillerCounts[p.id] }));

    onNext({
      bouquet: selectedBouquet,
      fillers: selectedFillers,
      basePrice: selectedBouquet.price,
    });
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-gray-400">Loading products...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>

        <h2 className="mb-2 text-center text-2xl font-semibold text-gray-800">
          Build Your Bouquet
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          Choose one bouquet, then pick exactly 2 fillers.
        </p>

        <div className="space-y-10">

          {/* Bouquets — single select */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Bouquets</h3>
              {selectedBouquet && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                  ✓ Selected
                </span>
              )}
            </div>

            {bouquets.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No bouquets available</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {bouquets.map((product) => {
                  const isSelected = selectedBouquet?.id === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedBouquet(isSelected ? null : product)}
                      className={`group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all ${
                        isSelected
                          ? "ring-2 ring-rose-400 shadow-md"
                          : "hover:shadow-md"
                      }`}
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={`http://localhost:8000${product.image}`}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-rose-500/20">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                          {product.description}
                        </p>
                        <p className="mt-2 text-sm font-bold text-rose-500">
                          ₱{Number(product.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Fillers — max 2 total */}
          <section>
            <div className="mb-1 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Fillers</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                totalFillers === 2
                  ? "bg-rose-100 text-rose-600"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {totalFillers}/2 selected
              </span>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              Pick exactly 2 fillers. You may pick 2 of the same or 2 different.
            </p>

            {fillers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No fillers available</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {fillers.map((product) => {
                  const qty = fillerCounts[product.id] || 0;
                  const atMax = totalFillers >= 2;
                  return (
                    <div
                      key={product.id}
                      className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition-all ${
                        qty > 0 ? "ring-2 ring-rose-400 shadow-md" : "hover:shadow-md"
                      }`}
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={`http://localhost:8000${product.image}`}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {qty > 0 && (
                          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow">
                            {qty}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                          {product.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          {/* Quantity control */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseFiller(product.id)}
                              disabled={qty === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-30"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm font-semibold text-gray-700">
                              {qty}
                            </span>
                            <button
                              onClick={() => increaseFiller(product.id)}
                              disabled={atMax && qty === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sticky Next Bar */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 border-t bg-white px-6 py-4 shadow-xl transition-transform duration-300 ${
            canProceed ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-500">
                {selectedBouquet?.name} + {totalFillers} filler{totalFillers !== 1 ? "s" : ""}
              </p>
              <p className="text-base font-bold text-gray-800">
                ₱{Number(selectedBouquet?.price || 0).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleNext}
              className="flex-shrink-0 rounded-xl bg-rose-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95"
            >
              Next →
            </button>
          </div>
        </div>

        {canProceed && <div className="h-24" />}
      </div>
    </div>
  );
}

export default OrderCustom;