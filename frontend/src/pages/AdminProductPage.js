import { useState } from "react";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

function AdminProductPage() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/products", {
      name,
      image,
      price,
    });

    setName("");
    setImage("");
    setPrice("");
    alert("Product added!");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 px-10 py-10">
        <h2 className="mb-6 text-2xl font-semibold">
          Add Product
        </h2>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
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

          <button className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProductPage;
