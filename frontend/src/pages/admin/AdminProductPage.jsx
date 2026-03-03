/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useProducts } from "../../contexts/ProductContext";

const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="relative rounded border p-4 shadow-sm">
    <div className="mb-2">
      {product.isAvailable ? (
        <span className="flex items-center text-xs font-bold text-green-600">
          <span className="mr-1">✓</span> Available
        </span>
      ) : (
        <span className="text-xs font-bold text-red-500">Out of Stock</span>
      )}
    </div>
    <img
      src={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${product.image}`}
      alt={product.name}
      className={`mb-3 h-40 w-full rounded object-cover ${!product.isAvailable && "grayscale opacity-60"}`}
    />
    <h1 className="font-medium">{product.name}</h1>
    <h3 className="text-sm text-gray-600">{product.description}</h3>
    <p className="text-gray-500">₱{product.price}</p>
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => onEdit(product)}
        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(product.id)}
        className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  </div>
);

const SectionGrid = ({ title, items, emptyMsg, onEdit, onDelete }) => (
  <div>
    {title && (
      <h4 className="mb-3 text-base font-semibold text-gray-600">{title}</h4>
    )}
    {items.length === 0 ? (
      <p className="py-6 text-center text-gray-400">{emptyMsg}</p>
    ) : (
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </div>
);

function AdminProductPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [isAvailable, setIsAvailable] = useState(1);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateProduct(currentId, { name, image, price, description, category, type, isAvailable });
        setMessage("Product updated successfully!");
      } else {
        await addProduct({ name, image, price, description, category, type, isAvailable });
        setMessage("Product added successfully!");
      }
      setMessageType("success");
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Operation failed", error);
      setMessage("Operation failed.");
      setMessageType("error");
    }
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setMessage("Product deleted successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to delete product.");
      setMessageType("error");
    }
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3000);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setImage(null);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(product.category);
    setType(product.type || "");
    setIsAvailable(product.isAvailable);
    setShowModal(true);
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setPrice("");
    setDescription("");
    setCategory("");
    setType("");
    setIsAvailable(1);
    setCurrentId(null);
    setIsEditing(false);
  };

  // Grouped products
  const bouquets = products.filter((p) => p.category === "Bouquets");
  const mainFlowers = products.filter((p) => p.category === "Additional" && p.type === "Main Flowers");
  const fillers = products.filter((p) => p.category === "Additional" && p.type === "Fillers");

  return (
    <div className="px-10 py-10">
      {message && (
        <div className={`mb-4 rounded px-4 py-2 text-white ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {message}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      <div className="space-y-10">
        {/* Bouquets Section */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 border-b pb-2">Bouquets</h3>
          <SectionGrid
            title=""
            items={bouquets}
            emptyMsg="No bouquets yet"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Additional Section */}
        <div>
          <h3 className="mb-6 text-xl font-semibold text-gray-700 border-b pb-2">Additional</h3>
          <div className="space-y-8">
            <SectionGrid
              title="Main Flowers"
              items={mainFlowers}
              emptyMsg="No main flowers yet"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <SectionGrid
              title="Fillers"
              items={fillers}
              emptyMsg="No fillers yet"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold">
              {isEditing ? "Edit Product" : "Add Product"}
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
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="rounded border px-4 py-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm"
                  required={!isEditing}
                />
                {!image && isEditing && <p className="mt-1 text-xs text-gray-400">No new file chosen — existing image will be kept</p>}
              </div>

              <input
                type="number"
                className="w-full rounded border px-4 py-2"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              {/* Category */}
              <div className="rounded border p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="Bouquets"
                      checked={category === "Bouquets"}
                      onChange={(e) => { setCategory(e.target.value); setType(""); }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Bouquets</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="Additional"
                      checked={category === "Additional"}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Additional</span>
                  </label>
                </div>
              </div>

              {/* Type — only shown when Additional is selected */}
              {category === "Additional" && (
                <div className="rounded border p-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="Main Flowers"
                        checked={type === "Main Flowers"}
                        onChange={(e) => setType(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Main Flowers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="Fillers"
                        checked={type === "Fillers"}
                        onChange={(e) => setType(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Fillers</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="rounded border p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Availability Status</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      value={1}
                      checked={!!isAvailable}
                      onChange={() => setIsAvailable(1)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-green-600 font-medium">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      value={0}
                      checked={!isAvailable}
                      onChange={() => setIsAvailable(0)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {isEditing ? "Update" : "Add"}
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