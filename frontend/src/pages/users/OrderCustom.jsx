import { useState } from "react";
import { useProducts } from "../../contexts/ProductContext";

function OrderCustom({ onBack, onNext }) {
  const { products, loading } = useProducts();

  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [mainCounts, setMainCounts] = useState({});
  const [fillerCounts, setFillerCounts] = useState({});

  const availableProducts = products.filter((p) => p.isAvailable);
  const bouquets = availableProducts.filter((p) => p.category === "Bouquets");
  const mainFlowers = availableProducts.filter((p) => p.category === "Additional" && p.type === "Main Flowers");
  const fillers = availableProducts.filter((p) => p.category === "Additional" && p.type === "Fillers");

  const requiredMainCount = Number(selectedBouquet?.required_main_count ?? 1);
  const requiredFillerCount = Number(selectedBouquet?.required_filler_count ?? 2);
  const totalMains = Object.values(mainCounts).reduce((sum, q) => sum + q, 0);

  const totalFillers = Object.values(fillerCounts).reduce((sum, q) => sum + q, 0);

  const increaseMain = (id) => {
    if (totalMains >= requiredMainCount) return;
    setMainCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decreaseMain = (id) => {
    setMainCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  const increaseFiller = (id) => {
    if (totalFillers >= requiredFillerCount) return;
    setFillerCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decreaseFiller = (id) => {
    setFillerCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  const canProceed =
    selectedBouquet &&
    totalMains === requiredMainCount &&
    totalFillers === requiredFillerCount;

  const handleNext = () => {
    const selectedMains = mainFlowers
      .filter((p) => (mainCounts[p.id] || 0) > 0)
      .map((p) => ({ ...p, quantity: mainCounts[p.id] }));

    const selectedFillers = fillers
      .filter((p) => (fillerCounts[p.id] || 0) > 0)
      .map((p) => ({ ...p, quantity: fillerCounts[p.id] }));

    onNext({
      bouquet: selectedBouquet,
      mains: selectedMains,
      fillers: selectedFillers,
      basePrice: selectedBouquet.price,
    });
  };

  const handleBouquetSelect = (product) => {
    const isSameBouquet = selectedBouquet?.id === product.id;
    setSelectedBouquet(isSameBouquet ? null : product);
    setMainCounts({});
    setFillerCounts({});
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
          Choose one bouquet, then complete its included flower requirements.
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
                      onClick={() => handleBouquetSelect(product)}
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
                        <p className="mt-2 text-xs text-gray-400">
                          Includes {Number(product.required_main_count ?? 1)} main flower{Number(product.required_main_count ?? 1) !== 1 ? "s" : ""} and {Number(product.required_filler_count ?? 2)} filler{Number(product.required_filler_count ?? 2) !== 1 ? "s" : ""}.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Main Flowers */}
          {requiredMainCount > 0 && (
          <section>
            <div className="mb-1 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Main Flowers</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                totalMains === requiredMainCount
                  ? "bg-rose-100 text-rose-600"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {totalMains}/{requiredMainCount} selected
              </span>
            </div>
              <p className="mb-4 text-xs text-gray-400">
                Pick exactly {requiredMainCount} main flower{requiredMainCount !== 1 ? "s" : ""}. You may mix or repeat selections.
              </p>

            {mainFlowers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No main flowers available</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {mainFlowers.map((product) => {
                  const qty = mainCounts[product.id] || 0;
                  const atMax = totalMains >= requiredMainCount;
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseMain(product.id)}
                              disabled={qty === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-30"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm font-semibold text-gray-700">
                              {qty}
                            </span>
                            <button
                              onClick={() => increaseMain(product.id)}
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
          )}

          {/* Fillers */}
          {requiredFillerCount > 0 && (
          <section>
            <div className="mb-1 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Fillers</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                totalFillers === requiredFillerCount
                  ? "bg-rose-100 text-rose-600"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {totalFillers}/{requiredFillerCount} selected
              </span>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              Pick exactly {requiredFillerCount} filler{requiredFillerCount !== 1 ? "s" : ""}. You may mix or repeat selections.
            </p>

            {fillers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No fillers available</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {fillers.map((product) => {
                  const qty = fillerCounts[product.id] || 0;
                  const atMax = totalFillers >= requiredFillerCount;
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
          )}
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
                {[
                  selectedBouquet?.name,
                  requiredMainCount > 0
                    ? `${totalMains}/${requiredMainCount} main flower${requiredMainCount !== 1 ? "s" : ""}`
                    : "No main flowers required",
                  requiredFillerCount > 0
                    ? `${totalFillers}/${requiredFillerCount} filler${requiredFillerCount !== 1 ? "s" : ""}`
                    : "No fillers required",
                ].filter(Boolean).join(" + ")}
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
