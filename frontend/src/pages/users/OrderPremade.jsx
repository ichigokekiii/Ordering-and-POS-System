import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePremades } from "../../contexts/PremadeContext";
import { useCart } from "../../contexts/CartContext";

function OrderModal({ product, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    onConfirm(product, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-64 w-full overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {product.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-[#3F5AE0]">
              ₱{product.price}
            </span>
            <span className="text-sm text-gray-400">per bouquet</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-10 w-10 rounded-full border text-lg"
            >
              −
            </button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="h-10 w-10 rounded-full border text-lg"
            >
              +
            </button>
            <span className="ml-auto text-sm">
              Subtotal: ₱{(product.price * quantity).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-6 w-full rounded-lg bg-[#3F5AE0] py-3 text-white hover:opacity-90"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderPremadePage() {
  const { premades, loading } = usePremades();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  const availableProducts = useMemo(
    () => premades.filter((p) => p.isAvailable === 1),
    [premades]
  );

  const totalPages = Math.ceil(
    availableProducts.length / ITEMS_PER_PAGE
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return availableProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [availableProducts, currentPage]);

  const handleConfirm = (product, quantity) => {
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-gray-400">
          Loading products...
        </p>
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

      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate("/cart")}
              className="relative rounded-full bg-[#3F5AE0] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => navigate("/order")}
            className="mb-6 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>

          <h2 className="mb-8 text-center text-2xl font-semibold">
            Premade Bouquets
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-[#3F5AE0]">
                      ₱{product.price}
                    </span>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-md bg-[#3F5AE0] px-3 py-1 text-xs text-white hover:opacity-90"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-9 w-9 rounded-full text-sm ${
                    currentPage === i + 1
                      ? "bg-[#3F5AE0] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderPremadePage;