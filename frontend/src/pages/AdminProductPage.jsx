import { useEffect, useState } from "react";
import api from "../services/api";
import { useProducts } from "../contexts/ProductContext";


function AdminProductPage() {
  const { products, addProduct, setProducts } =
  useProducts();

  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

 useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  fetchProducts();
}, []);

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addProduct({ name, image, price });


      setMessage("Product added successfully!");
      setMessageType("success");

      setName("");
      setImage("");
      setPrice("");
      setShowModal(false);

    } catch (error) {
      console.error("Failed to add product", error);
      setMessage("Failed to add product.");
      setMessageType("error");
    }

    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  return (
    <div className="px-10 py-10">
      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 rounded px-4 py-2 text-white ${
            messageType === "success"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>

        <button
          onClick={() => setShowModal(true)}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
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
            <p className="text-gray-500">₱{product.price}</p>

            <div className="mt-4 flex gap-2">
              <button className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
                Edit
              </button>
              <button className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Add Product
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />

              <input
                type="number"
                className="w-full rounded border px-4 py-2"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductPage;
