import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";

function QuantityControl({ quantity, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-30"
        disabled={quantity === 0}
      >
        −
      </button>
      <span className="w-4 text-center text-sm font-semibold text-gray-700">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500"
      >
        +
      </button>
    </div>
  );
}

function ProductCard({ product, quantity, onIncrease, onDecrease }) {
  return (
    <div
      className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition-all ${
        quantity > 0 ? "ring-2 ring-rose-400 shadow-md" : "hover:shadow-md"
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {quantity > 0 && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow">
            {quantity}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-rose-500">
            ₱{product.price}
          </span>
          <QuantityControl
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        </div>
      </div>
    </div>
  );
}

function OrderCustom() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // quantities keyed by product id: { [id]: number }
  const [quantities, setQuantities] = useState({});
  const [added, setAdded] = useState(false);

  const availableProducts = products.filter((p) => p.isAvailable === 1);
  const mainFlowers = availableProducts.filter((p) => p.category === "Main Flower");
  const fillers = availableProducts.filter((p) => p.category === "Filler");

  const increase = (id) =>
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const decrease = (id) =>
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));

  // Check at least one main flower and one filler selected
  const hasMainFlower = mainFlowers.some((p) => (quantities[p.id] || 0) > 0);
  const hasFiller = fillers.some((p) => (quantities[p.id] || 0) > 0);
  const canAddToCart = hasMainFlower && hasFiller;

  // Build a summary of what was picked
  const selectedItems = availableProducts
    .filter((p) => (quantities[p.id] || 0) > 0)
    .map((p) => ({ ...p, quantity: quantities[p.id] }));

  const bouquetTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Label shown in cart e.g. "Rose ×2, Baby's Breath ×1"
  const bouquetLabel = selectedItems
    .map((item) => `${item.name} ×${item.quantity}`)
    .join(", ");

  const handleAddToCart = () => {
    // Add as a single bundled cart item
    const bouquet = {
      id: `custom-${Date.now()}`,        // unique id per bouquet
      type: "custom",
      name: "Custom Bouquet",
      description: bouquetLabel,
      price: bouquetTotal,               // total price baked in, quantity=1
      image: selectedItems[0]?.image,    // use first selected flower as thumbnail
      items: selectedItems,              // store breakdown for cart display
    };

    addToCart(bouquet, 1);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
      setQuantities({});                 // reset selections for next bouquet
      navigate("/order");
    }, 800);
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
          onClick={() => navigate("/order")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>

        <h2 className="mb-2 text-center text-2xl font-semibold text-gray-800">
          Build Your Bouquet
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          Pick at least one main flower and one filler to create your custom bouquet.
        </p>

        <div className="space-y-10">
          {/* Main Flowers */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">
                Main Flowers
              </h3>
              {hasMainFlower && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                  ✓ Selected
                </span>
              )}
            </div>
            {mainFlowers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">
                No main flowers available
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {mainFlowers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id] || 0}
                    onIncrease={() => increase(product.id)}
                    onDecrease={() => decrease(product.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Fillers */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Fillers</h3>
              {hasFiller && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                  ✓ Selected
                </span>
              )}
            </div>
            {fillers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">
                No fillers available
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {fillers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id] || 0}
                    onIncrease={() => increase(product.id)}
                    onDecrease={() => decrease(product.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sticky Add to Cart Bar */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 border-t bg-white px-6 py-4 shadow-xl transition-transform duration-300 ${
            canAddToCart ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            {/* Summary */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-500">{bouquetLabel}</p>
              <p className="text-base font-bold text-gray-800">
                ₱{bouquetTotal.toLocaleString()}
              </p>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={added}
              className="flex-shrink-0 rounded-xl bg-rose-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95 disabled:bg-rose-300"
            >
              {added ? "✓ Added!" : "Add Bouquet to Cart"}
            </button>
          </div>
        </div>

        {/* Bottom padding so content isn't hidden behind sticky bar */}
        {canAddToCart && <div className="h-24" />}
      </div>
    </div>
  );
}

export default OrderCustom;