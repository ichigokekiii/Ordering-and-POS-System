/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useProducts } from "../../contexts/ProductContext";

// Validation rules
const VALIDATION = {
  name: {
    regex: /^[a-zA-Z0-9 \-'&]+$/,
    maxLength: 50,
    message: "Name must be letters, numbers, spaces, hyphens, apostrophes, or & only (max 50 chars)",
  },
  description: {
    regex: /^[a-zA-Z0-9 .,!?'\-&()\n]+$/,
    maxLength: 200,
    message: "Description contains invalid characters (max 200 chars)",
  },
  price: {
    regex: /^\d+(\.\d{0,2})?$/,
    maxLength: 7,
    message: "Price must be a valid number with up to 2 decimal places",
  },
};

const validate = (field, value) => {
  const rule = VALIDATION[field];
  if (!value) return "This field is required";
  if (value.length > rule.maxLength) return rule.message;
  if (!rule.regex.test(value)) return rule.message;
  return "";
};

const CharCount = ({ value, max }) => (
  <span className={`text-xs ${value.length > max ? "text-red-500" : "text-gray-400"}`}>
    {value.length}/{max}
  </span>
);

const FieldError = ({ error }) =>
  error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null;

const ProductCard = ({ product, onEdit, onDelete, canEdit }) => (
  <div className="relative rounded border p-4 shadow-sm bg-white">
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
    
    {/* Hide Edit/Delete buttons if user is staff */}
    {canEdit && (
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
    )}
  </div>
);

const SectionGrid = ({ title, items, emptyMsg, onEdit, onDelete, canEdit }) => (
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
            canEdit={canEdit}
          />
        ))}
      </div>
    )}
  </div>
);

// 1. Accept the 'user' prop
function AdminProductPage({ user }) {
  const {
    products,
    premades,
    addProduct,
    addPremade,
    updateProduct,
    updatePremade,
    deleteProduct,
    deletePremade,
  } = useProducts();

  // 2. Define who is allowed to edit
  const canEdit = user?.role === "admin" || user?.role === "owner";

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

  const [errors, setErrors] = useState({ name: "", description: "", price: "", image: "" });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    setErrors(prev => ({ ...prev, image: "Image must be under 2MB. Please compress it first." }));
    setImage(null);
    e.target.value = "";
    return;
  }
  setErrors(prev => ({ ...prev, image: "" }));
  setImage(file);
};

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const sanitized = raw.split(".").length > 2 ? raw.slice(0, raw.lastIndexOf(".")) : raw;
    handleFieldChange("price", sanitized, setPrice);
  };

  const validateAll = () => {
    const newErrors = {
      name: validate("name", name),
      description: validate("description", description),
      price: validate("price", price),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      if (activeTab === "products") {
        if (isEditing) {
          await updateProduct(currentId, { name, image, price, description, category, type, isAvailable });
          setMessage("Product updated successfully!");
        } else {
          await addProduct({ name, image, price, description, category, type, isAvailable });
          setMessage("Product added successfully!");
        }
      } else {
        if (isEditing) {
          await updatePremade(currentId, { name, image, price, description, isAvailable });
          setMessage("Premade updated successfully!");
        } else {
          await addPremade({ name, image, price, description, isAvailable });
          setMessage("Premade added successfully!");
        }
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
      if (activeTab === "products") {
        await deleteProduct(id);
      } else {
        await deletePremade(id);
      }
      setMessage(`${activeTab === "products" ? "Product" : "Premade"} deleted successfully!`);
      setMessageType("success");
    } catch (error) {
      setMessage(`Failed to delete ${activeTab === "products" ? "product" : "premade"}.`);
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
    setErrors({ name: "", description: "", price: "" });
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
    setErrors({ name: "", description: "", price: "", image: "" });
  };

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
          {activeTab === "products" ? "+ Add Product" : "+ Add Premade"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 border-b-2 ${activeTab === "products" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("premades")}
          className={`px-4 py-2 border-b-2 ${activeTab === "premades" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
        >
          Premades
        </button>
      </div>

      {activeTab === "products" && (
        <div className="space-y-10">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-700 pb-2">Bouquets</h3>
            <SectionGrid
              title=""
              items={bouquets}
              emptyMsg={canEdit ? "No bouquets yet" : "No bouquets available"}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
          />
          </div>
          <div>
            <h3 className="mb-6 text-xl font-semibold text-gray-700 pb-2">Additional</h3>
            <div className="space-y-8">
              <SectionGrid
                title="Main Flowers"
                items={mainFlowers}
                emptyMsg={canEdit ? "No main flowers yet" : "No main flowers available"}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
            />
              <SectionGrid
                title="Fillers"
                items={fillers}
                emptyMsg={canEdit ? "No fillers yet" : "No fillers available"}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
            />
            </div>
          </div>
        </div>
      )}

      {activeTab === "premades" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700 pb-2">Premades</h3>
          {premades.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50">
              <p className="text-gray-400">No premades yet</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {premades.map((premade) => (
                <ProductCard
                  key={premade.id}
                  product={premade}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal - only render if the user has permission to edit */}
      {showModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold">
              {isEditing
                ? activeTab === "products" ? "Edit Product" : "Edit Premade"
                : activeTab === "products" ? "Add Product" : "Add Premade"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Product Name</label>
                  <CharCount value={name} max={VALIDATION.name.maxLength} />
                </div>
                <input
                  className={`mt-1 w-full rounded border px-4 py-2 ${errors.name ? "border-red-400 focus:outline-red-400" : ""}`}
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => handleFieldChange("name", e.target.value, setName)}
                  maxLength={VALIDATION.name.maxLength}
                  required
                />
                <FieldError error={errors.name} />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <CharCount value={description} max={VALIDATION.description.maxLength} />
                </div>
                <input
                  className={`mt-1 w-full rounded border px-4 py-2 ${errors.description ? "border-red-400 focus:outline-red-400" : ""}`}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                  maxLength={VALIDATION.description.maxLength}
                  required
                />
                <FieldError error={errors.description} />
              </div>

              {/* Image */}
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
<FieldError error={errors.image} />  {/* ADD THIS LINE */}
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <CharCount value={price} max={VALIDATION.price.maxLength} />
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  className={`mt-1 w-full rounded border px-4 py-2 ${errors.price ? "border-red-400 focus:outline-red-400" : ""}`}
                  placeholder="Price (e.g. 299.99)"
                  value={price}
                  onChange={handlePriceChange}
                  maxLength={VALIDATION.price.maxLength}
                  required
                />
                <FieldError error={errors.price} />
              </div>

              {/* Category + Type */}
              {activeTab === "products" && (
                <>
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

                  {/* Type */}
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
                </>
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
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="rounded border px-4 py-2 hover:bg-gray-50">
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