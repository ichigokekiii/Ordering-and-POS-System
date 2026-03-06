/* eslint-disable react-hooks/immutability */

import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavbar } from "../../contexts/NavbarContext";

export default function ProfilePage() {
  const { updateUser } = useNavbar();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddresses, setEditingAddresses] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");

      setProfile(res.data);
      setAddresses(res.data.addresses || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...addresses];
    updated[index][field] = value;
    setAddresses(updated);
  };

  const addAddress = () => {
    if (addresses.length >= 3) return;

    setAddresses([
      ...addresses,
      {
        house_number: "",
        street: "",
        barangay: "",
        city: "",
        zip_code: "",
      },
    ]);
  };

  const removeAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);

    if (updated.length === 0) {
      setEditingAddresses(false);
    }

    try {
      await api.put("/profile", {
        addresses: updated
      });

      // refresh profile so UI and DB stay in sync
      fetchProfile();
    } catch (err) {
      console.error("Failed to auto-save address removal", err);
      alert("Failed to remove address. Please try again.");
    }
  };

  const saveProfile = async () => {
    try {
      const res = await api.put("/profile", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone_number: profile.phone_number
      });

      // Update navbar context instantly
      updateUser({
        ...profile,
        ...(res.data || {})
      });

      alert("Personal information updated!");
      setEditingProfile(false);
      fetchProfile();
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to update personal information.");
    }
  };

  const saveAddresses = async () => {
    try {

      await api.put("/profile", {
        addresses: addresses
      });

      alert("Addresses updated!");
      setEditingAddresses(false);
      fetchProfile();
    } catch (err) {
      console.error("Address update failed", err);
      alert("Failed to update addresses.");
    }
  };

  if (loading) return <div className="mx-auto max-w-4xl px-8 pt-28">Loading profile...</div>;

  return (
    <div className="mx-auto max-w-4xl px-8 pt-28 pb-32">

      <h2 className="text-2xl font-semibold mb-6">My Account</h2>

      <div className="space-y-8">

        {/* PERSONAL INFORMATION */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Personal Information</h3>

            <button
              type="button"
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-sm text-[#4f6fa5] hover:underline"
            >
              {editingProfile ? "Cancel" : "Edit Details"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm block mb-1">First Name</label>
              <input
                name="first_name"
                value={profile?.first_name ?? ""}
                onChange={handleProfileChange}
                className={`w-full rounded border px-4 py-2 disabled:bg-gray-100 ${editingProfile ? "text-black" : "text-gray-500"}`}
                disabled={!editingProfile}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Last Name</label>
              <input
                name="last_name"
                value={profile?.last_name ?? ""}
                onChange={handleProfileChange}
                className={`w-full rounded border px-4 py-2 disabled:bg-gray-100 ${editingProfile ? "text-black" : "text-gray-500"}`}
                disabled={!editingProfile}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Contact Number</label>
              <input
                name="phone_number"
                value={profile?.phone_number ?? ""}
                onChange={handleProfileChange}
                className={`w-full rounded border px-4 py-2 disabled:bg-gray-100 ${editingProfile ? "text-black" : "text-gray-500"}`}
                disabled={!editingProfile}
              />
            </div>

            <div>
              <label className="text-sm block mb-1">Email Address</label>
              <input
                name="email"
                value={profile?.email ?? ""}
                onChange={handleProfileChange}
                className={`w-full rounded border px-4 py-2 disabled:bg-gray-100 ${editingProfile ? "text-black" : "text-gray-500"}`}
                disabled={!editingProfile}
              />
            </div>

          </div>
          {editingProfile && (
            <div className="pt-4">
              <button
                onClick={saveProfile}
                className="rounded bg-[#4f6fa5] px-6 py-2 text-white hover:bg-[#3f5b89] transition"
              >
                Save Personal Information
              </button>
            </div>
          )}
        </div>

        {/* ADDRESSES */}
        <div className="border rounded-lg p-6 space-y-6">

          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              Shipping Addresses ({addresses.length}/3)
            </h3>

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => setEditingAddresses(!editingAddresses)}
                className="text-sm text-[#4f6fa5] hover:underline"
              >
                {editingAddresses ? "Cancel" : "Edit Addresses"}
              </button>

              {editingAddresses && addresses.length < 3 && (
                <button
                  type="button"
                  onClick={addAddress}
                  className="rounded bg-[#4f6fa5] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f5b89] transition shadow-sm"
                >
                  + Add Address
                </button>
              )}

            </div>
          </div>

          {addresses.length === 0 && !editingAddresses && (
            <div className="rounded border border-dashed p-6 text-center text-gray-500">
              You don't have any saved addresses yet.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddresses(true);
                    addAddress();
                  }}
                  className="rounded bg-[#4f6fa5] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f5b89] transition"
                >
                  + Add Address
                </button>
              </div>
            </div>
          )}
          {addresses.map((addr, index) => (
            <div key={index} className="border rounded p-4 space-y-3">

              <div className="flex justify-between items-center">
                <p className="font-medium text-[#4f6fa5]">
                  Address #{index + 1}
                </p>

                {editingAddresses && (
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="rounded border border-red-200 px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">

                <input
                  placeholder="House Number"
                  value={addr.house_number}
                  onChange={(e) =>
                    handleAddressChange(index, "house_number", e.target.value)
                  }
                  className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"}`}
                  disabled={!editingAddresses}
                />

                <input
                  placeholder="Street"
                  value={addr.street}
                  onChange={(e) =>
                    handleAddressChange(index, "street", e.target.value)
                  }
                  className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"}`}
                  disabled={!editingAddresses}
                />

                <input
                  placeholder="Barangay"
                  value={addr.barangay}
                  onChange={(e) =>
                    handleAddressChange(index, "barangay", e.target.value)
                  }
                  className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"}`}
                  disabled={!editingAddresses}
                />

                <input
                  placeholder="City"
                  value={addr.city}
                  onChange={(e) =>
                    handleAddressChange(index, "city", e.target.value)
                  }
                  className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"}`}
                  disabled={!editingAddresses}
                />

                <input
                  placeholder="Zip Code"
                  value={addr.zip_code}
                  onChange={(e) =>
                    handleAddressChange(index, "zip_code", e.target.value)
                  }
                  className={`rounded border px-4 py-2 col-span-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"}`}
                  disabled={!editingAddresses}
                />

              </div>
            </div>
          ))}
          {editingAddresses && (
            <div className="pt-4">
              <button
                onClick={saveAddresses}
                className="rounded bg-[#4f6fa5] px-6 py-2 text-white hover:bg-[#3f5b89] transition"
              >
                Save Addresses
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}