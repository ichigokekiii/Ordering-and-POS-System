import { usePremades } from "../contexts/PremadeContext";

function ProductPage() {
  const { premades, loading } = usePremades();

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="px-8 py-10">
      <h2 className="mb-8 text-2xl font-semibold">Product Showcase</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {premades.map((product) => (
          <div
            key={product.id}
            className="rounded border p-4 shadow-sm"
          >
            <img
              src={product.image}
              alt={product.name}
              className="mb-3 h-40 w-full rounded object-cover"
            />
            <h1 className="font-medium">{product.name}</h1>
            <h3 className="font-medium">{product.description}</h3>
            <p className="text-gray-500">₱{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductPage;
