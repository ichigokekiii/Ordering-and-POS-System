import { useProducts } from "../contexts/ProductContext";

function OrderCustom() {
  const { products, loading } = useProducts();

  const availableProducts = products.filter(p => p.isAvailable === 1);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="px-8 py-10">
      <h2 className="mb-8 text-2xl font-semibold text-center">Custom Made Order</h2>

      <div className="space-y-8">
        {/* Main Flower Section */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 text-center">Main Flowers</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {availableProducts
              .filter((product) => product.category === "Main Flower")
              .map((product) => (
                <div
                  key={product.id}
                  className="rounded border p-4 shadow-sm"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="mb-3 h-40 w-full rounded object-cover"
                  />
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-gray-500">₱{product.price}</p>
                </div>
              ))}
          </div>
          {availableProducts.filter((p) => p.category === "Main Flower").length === 0 && (
            <p className="text-gray-400 text-center py-8">No main flowers available</p>
          )}
        </div>

        {/* Filler Section */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 text-center">Fillers</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {availableProducts
              .filter((product) => product.category === "Filler")
              .map((product) => (
                <div
                  key={product.id}
                  className="rounded border p-4 shadow-sm"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="mb-3 h-40 w-full rounded object-cover"
                  />
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-gray-500">₱{product.price}</p>
                </div>
              ))}
          </div>
          {availableProducts.filter((p) => p.category === "Filler").length === 0 && (
            <p className="text-gray-400 text-center py-8">No fillers available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderCustom;