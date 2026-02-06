import { useState } from "react";
import { usePremades } from "../contexts/PremadeContext";

function AdminPremadePage() {
  const {
    premades,
    addPremade,
    updatePremade,
    deletePremade,
  } = usePremades();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(1); 

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // add and update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updatePremade(currentId, { name, image, price, description, isAvailable });
        setMessage("Premade updated successfully!");
      } else {
        await addPremade({ name, image, price, description, isAvailable });
        setMessage("Premade added successfully!");
      }

      setMessageType("success");
      resetForm();
      setShowModal(false);

    } catch (error) {
      console.error("Operation failed", error);
      setMessage("Operation failed.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Premade?")) return;

    try {
      await deletePremade(id);
      setMessage("Premade deleted successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Delete failed", error);
      setMessage("Failed to delete Premade.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // edit modal
  const handleEdit = (premade) => {
    setIsEditing(true);
    setCurrentId(premade.id);
    setName(premade.name);
    setImage(premade.image);
    setPrice(premade.price);
    setDescription(premade.description);
    setIsAvailable(premade.isAvailable);
    setShowModal(true);
  };

  const resetForm = () => {
    setName("");
    setImage("");
    setPrice("");
    setDescription("");
    setIsAvailable(1); 
    setCurrentId(null);
    setIsEditing(false);
  };

  return (
    <div className="px-10 py-10">
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

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Premades</h2>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Premade
        </button>
      </div>

      {/* Premade List */}
      <div className="grid gap-6 md:grid-cols-3">
        {premades.map((premade) => (
          <div
            key={premade.id}
            className="relative rounded border p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-1">
              {premade.isAvailable ? (
                <span className="flex items-center text-xs font-bold text-green-600">
                  <span className="mr-1">✓</span> Available
                </span>
              ) : (
                <span className="text-xs font-bold text-red-500">
                  Out of Stock
                </span>
              )}
            </div>

            <img
              src={premade.image}
              alt={premade.name}
              className={`mb-3 h-40 w-full rounded object-cover ${!premade.isAvailable && 'grayscale opacity-60'}`}
            />

            <h1 className="font-medium">{premade.name}</h1>
            <h3 className="font-medium">{premade.description}</h3>
            <p className="text-gray-500">₱{premade.price}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(premade)}
                className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(premade.id)}
                className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* add/edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {isEditing ? "Edit Premade" : "Add Premade"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Premade name"
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
                className="w-full rounded border px-4 py-2"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

              
              <div className="rounded border p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Availability Status
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAvailable"
                      value={1}
                      checked={isAvailable === 1}
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
                      checked={isAvailable === 0}
                      onChange={() => setIsAvailable(0)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  </label>
                </div>
              </div>

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

export default AdminPremadePage;