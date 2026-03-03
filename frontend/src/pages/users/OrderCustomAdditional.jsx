/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";

function OrderCustomAdditional() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const { bouquet, fillers = [], basePrice = 0 } = location.state || {};

  const [quantities, setQuantities] = useState({});
  const [added, setAdded] = useState(false);

  // Redirect safely if someone lands here directly without state
  useEffect(() => {
    if (!bouquet) {
      navigate("/order/custom");
    }
  }, [bouquet, navigate]);

  if (!bouquet) return null;

  const availableProducts = products.filter((p) => p.isAvailable);
  const additionalMainFlowers = availableProducts.filter(
    (p) => p.category === "Additional" && p.type === "Main Flowers"
  );
  const additionalFillers = availableProducts.filter(
    (p) => p.category === "Additional" && p.type === "Fillers"
  );

  const increase = (id) =>
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const decrease = (id) =>
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));

  const selectedAdditionals = availableProducts
    .filter((p) => (quantities[p.id] || 0) > 0)
    .map((p) => ({ ...p, quantity: quantities[p.id] }));

  const additionalTotal = selectedAdditionals.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalPrice = Number(basePrice) + additionalTotal;

  const handleAddToCart = () => {
    const allItems = [
      { ...bouquet, quantity: 1 },
      ...fillers.map((f) => ({ ...f, free: true })),   // tag initial fillers as free
      ...selectedAdditionals,
    ];

    const descriptionParts = [
      bouquet.name,
      ...fillers.map((f) => `${f.name} ×${f.quantity}`),
      ...selectedAdditionals.map((a) => `${a.name} ×${a.quantity}`),
    ];

    const cartItem = {
      id: `custom-${Date.now()}`,
      type: "custom",
      name: "Custom Bouquet",
      description: descriptionParts.join(", "),
      price: totalPrice,
      image: bouquet.image,
      items: allItems,
    };

    addToCart(cartItem, 1);
    setAdded(true);

    setTimeout(() => {
      navigate("/order");
    }, 800);
  };

  const AdditionalCard = ({ product }) => {
    const qty = quantities[product.id] || 0;
    return (
      <div
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
            <span className="text-sm font-bold text-rose-500">
              +₱{Number(product.price).toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => decrease(product.id)}
                disabled={qty === 0}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-4 text-center text-sm font-semibold text-gray-700">
                {qty}
              </span>
              <button
                onClick={() => increase(product.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-400 hover:text-rose-500"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/order/custom")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>

        <h2 className="mb-2 text-center text-2xl font-semibold text-gray-800">
          Add Extra Flowers
        </h2>
        <p className="mb-2 text-center text-sm text-gray-400">
          Customize your bouquet further. Each addition is charged separately.
        </p>

        {/* Selected summary */}
        <div className="mb-8 rounded-xl border bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Your selection so far:</p>
          <p className="mt-1 text-sm text-gray-500">
            {bouquet.name} +{" "}
            {fillers.map((f) => `${f.name} ×${f.quantity}`).join(", ")}
          </p>
          <p className="mt-1 text-sm font-bold text-gray-800">
            Base price: ₱{Number(basePrice).toLocaleString()}
          </p>
        </div>

        <div className="space-y-10">
          {/* Additional Main Flowers */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Main Flowers</h3>
            {additionalMainFlowers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No main flowers available</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {additionalMainFlowers.map((product) => (
                  <AdditionalCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Additional Fillers */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Fillers</h3>
            {additionalFillers.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No fillers available</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {additionalFillers.map((product) => (
                  <AdditionalCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sticky Add to Cart Bar — always visible on this page */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white px-6 py-4 shadow-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">
                Base ₱{Number(basePrice).toLocaleString()}
                {additionalTotal > 0 && ` + ₱${additionalTotal.toLocaleString()} extras`}
              </p>
              <p className="text-base font-bold text-gray-800">
                Total: ₱{totalPrice.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={added}
              className="flex-shrink-0 rounded-xl bg-rose-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95 disabled:bg-rose-300"
            >
              {added ? "✓ Added!" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}

export default OrderCustomAdditional;