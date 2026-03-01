{/*import { usePremades } from "../../contexts/PremadeContext";

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
*/}
function ProductPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          In Progress
        </h2>

        <p className="text-gray-600 mb-8">
          Our product showcase is currently under development.
          <br />
          Please check back later.
        </p>

        <button
          onClick={() => window.history.back()}
          className="w-full border border-gray-300 rounded-xl py-3 text-center font-medium transition-all duration-500 hover:bg-[#5C6F9E] hover:text-white hover:border-[#5C6F9E]"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default ProductPage;
