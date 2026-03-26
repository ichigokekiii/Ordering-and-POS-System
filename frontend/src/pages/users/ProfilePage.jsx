/* eslint-disable react-hooks/immutability */

import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavbar } from "../../contexts/NavbarContext";

export default function ProfilePage() {
  const { updateUser, logoutUser } = useNavbar();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddresses, setEditingAddresses] = useState(false);

  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);

  const [addressErrors, setAddressErrors] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");

      setProfile(res.data);
      setAddresses(res.data.addresses || []);
      setNewEmail("");
      setEmailOtp("");
      setEmailOtpSent(false);
      setEmailChangeMode(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
      setPasswordOtpSent(false);
      setAddressErrors([]);
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

  const validatePersonalInfo = () => {
    const firstName = profile?.first_name?.trim() || "";
    const lastName = profile?.last_name?.trim() || "";
    const phoneNumber = profile?.phone_number?.trim() || "";

    const namePattern = /^[A-Za-z\s\-']{2,50}$/;

    if (!firstName || !namePattern.test(firstName)) {
      return "First name must be 2-50 letters and cannot contain special characters or gibberish.";
    }

    if (!lastName || !namePattern.test(lastName)) {
      return "Last name must be 2-50 letters and cannot contain special characters or gibberish.";
    }

    if (!phoneNumber || !/^\d{7,11}$/.test(phoneNumber)) {
      return "Contact number must be digits only and up to 11 characters.";
    }

    return null;
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...addresses];
    updated[index][field] = value;
    setAddresses(updated);

    // Validate this field
    validateAddressField(index, field, value);
  };

  const validateAddressField = (index, field, value) => {
    const errors = [...addressErrors];
    if (!errors[index]) errors[index] = {};

    const streetBarangayPattern = /^[A-Za-z0-9\s\-,\.#+]{1,100}$/;
    const cityPattern = /^[A-Za-z\s\-']{1,100}$/;
    const houseNumberPattern = /^\d{1,10}$/;

    if (field === 'zip_code') {
      if (!/^\d{4}$/.test(String(value).trim())) {
        errors[index][field] = 'Zip code must be exactly 4 digits.';
      } else {
        delete errors[index][field];
      }
    } else if (field === 'house_number') {
      if (!value.trim()) {
        errors[index][field] = 'House number is required.';
      } else if (!houseNumberPattern.test(value.trim())) {
        errors[index][field] = 'House number must be numeric.';
      } else {
        delete errors[index][field];
      }
    } else if (field === 'city') {
      if (!value.trim()) {
        errors[index][field] = 'City is required.';
      } else if (!cityPattern.test(value.trim())) {
        errors[index][field] = 'City must contain letters only.';
      } else {
        delete errors[index][field];
      }
    } else if (field === 'street' || field === 'barangay') {
      if (!value.trim()) {
        errors[index][field] = `${field === 'street' ? 'Street' : 'Barangay'} is required.`;
      } else if (value.length > 100) {
        errors[index][field] = 'This field must be at most 100 characters.';
      } else if (!streetBarangayPattern.test(value.trim())) {
        errors[index][field] = 'Only letters, numbers and - , . # + are allowed.';
      } else {
        delete errors[index][field];
      }
    }

    setAddressErrors(errors);
  };

  const validateAddresses = (addressesToValidate) => {
    const streetBarangayPattern = /^[A-Za-z0-9\s\-,\.#+]{1,100}$/;
    const cityPattern = /^[A-Za-z\s\-']{1,100}$/;
    const houseNumberPattern = /^\d{1,10}$/;

    for (let i = 0; i < addressesToValidate.length; i++) {
      const addr = addressesToValidate[i];
      if (!addr.house_number || !addr.street || !addr.barangay || !addr.city || !addr.zip_code) {
        return `Address #${i + 1}: all fields are required.`;
      }

      if (!houseNumberPattern.test(addr.house_number.trim())) {
        return `Address #${i + 1}: house number must be numeric.`;
      }

      if (!streetBarangayPattern.test(addr.street.trim())) {
        return `Address #${i + 1}: street may contain only letters, numbers and - , . # +`;
      }

      if (!streetBarangayPattern.test(addr.barangay.trim())) {
        return `Address #${i + 1}: barangay may contain only letters, numbers and - , . # +`;
      }

      if (!cityPattern.test(addr.city.trim())) {
        return `Address #${i + 1}: city must contain letters only (spaces allowed).`;
      }

      if (!/^\d{4}$/.test(String(addr.zip_code).trim())) {
        return `Address #${i + 1}: zip code must be exactly 4 digits.`;
      }
    }

    return null;
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

    // Initialize errors for new address
    setAddressErrors([...addressErrors, {}]);
  };

  const removeAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);

    // Remove errors for this address
    const updatedErrors = addressErrors.filter((_, i) => i !== index);
    setAddressErrors(updatedErrors);

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
    const validationError = validatePersonalInfo();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const res = await api.put("/profile", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
      });

      // Update navbar context instantly
      if (res.data && res.data.user) {
        updateUser(res.data.user);
      }

      alert("Personal information updated!");
      setEditingProfile(false);
      fetchProfile();
    } catch (err) {
      console.error("Profile update failed", err);
      alert(err.response?.data?.message || "Failed to update personal information.");
    }
  };

  const saveAddresses = async () => {
    // Check for any validation errors
    for (let i = 0; i < addressErrors.length; i++) {
      if (Object.keys(addressErrors[i]).length > 0) {
        alert(`Please fix errors in Address #${i + 1} before saving.`);
        return;
      }
    }

    // Also check required fields and value rules
    const validationMessage = validateAddresses(addresses);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      await api.put("/profile", {
        addresses: addresses
      });

      alert("Addresses updated!");
      setEditingAddresses(false);
      fetchProfile();
    } catch (err) {
      console.error("Address update failed", err);
      alert(err.response?.data?.message || "Failed to update addresses.");
    }
  };

  const sendEmailOtp = async () => {
    if (!newEmail || newEmail.trim() === "") {
      alert("Enter a new email address.");
      return;
    }

    if (newEmail === profile.email) {
      alert("New email must be different from current email.");
      return;
    }

    try {
      await api.post("/profile/email-otp", { email: newEmail.trim() });
      setEmailOtpSent(true);
      alert("OTP sent to new email. Please check your inbox.");
    } catch (err) {
      console.error("Email OTP request failed", err);
      alert(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.trim().length === 0) {
      alert("Enter OTP code.");
      return;
    }

    try {
      const res = await api.post("/profile/email-verify", {
        email: newEmail.trim(),
        otp: emailOtp.trim(),
      });

      alert(res.data?.message || "Email updated successfully.");
      setNewEmail("");
      setEmailOtp("");
      setEmailOtpSent(false);
      setEmailChangeMode(false);
      fetchProfile();
      if (res.data?.email) {
        updateUser({ ...profile, email: res.data.email });
      }
    } catch (err) {
      console.error("Email verification failed", err);
      alert(err.response?.data?.message || "Failed to verify OTP.");
    }
  };

  const sendPasswordOtp = async () => {
    if (!currentPassword) {
      alert("Enter your current password first.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("Enter new password and confirmation.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and retype password do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      alert("New password cannot be the same as current password.");
      return;
    }

    try {
      await api.post("/profile/password-otp");
      setPasswordOtpSent(true);
      alert("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      console.error("Password OTP request failed", err);
      alert(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const verifyPasswordOtp = async () => {
    if (!passwordOtp || passwordOtp.trim().length === 0) {
      alert("Enter OTP code.");
      return;
    }

    if (!currentPassword) {
      alert("Enter current password before verifying OTP.");
      return;
    }

    try {
      const res = await api.post("/profile/password-verify", {
        otp: passwordOtp.trim(),
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      alert(res.data?.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
      setPasswordOtpSent(false);
      setShowChangePassword(false);
    } catch (err) {
      console.error("Password verification failed", err);
      alert(err.response?.data?.message || "Failed to change password.");
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

    if (!confirmed) return;

    try {
      await api.delete("/profile");
      alert("Account deleted successfully.");
      logoutUser();
      window.location.href = "/login";
    } catch (err) {
      console.error("Account deletion failed", err);
      alert(err.response?.data?.message || "Failed to delete account.");
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
                className="w-full rounded border px-4 py-2 bg-gray-100 text-gray-500"
                readOnly
              />
              <button
                type="button"
                onClick={() => {
                  setEmailChangeMode(!emailChangeMode);
                  setEmailOtpSent(false);
                }}
                className="mt-2 text-sm text-[#4f6fa5] hover:underline"
              >
                {emailChangeMode ? "Cancel email change" : "Change Email"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="rounded bg-[#4f6fa5] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f5b89] transition"
            >
              {showChangePassword ? "Hide Change Password" : "Change Password"}
            </button>
            <button
              type="button"
              onClick={deleteAccount}
              className="rounded border border-red-500 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
            >
              Delete Account
            </button>
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

        {/* EMAIL CHANGE */}
        {emailChangeMode && (
          <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800">Change Email Address</h3>
              <button
                onClick={() => {
                  setEmailChangeMode(false);
                  setEmailOtpSent(false);
                  setNewEmail("");
                  setEmailOtp("");
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {!emailOtpSent ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={sendEmailOtp}
                  className="w-full rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition font-medium"
                >
                  Send Verification Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="w-full rounded border px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength="6"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We've sent a verification code to {newEmail}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={verifyEmailOtp}
                    className="flex-1 rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition font-medium"
                  >
                    Verify & Update Email
                  </button>
                  <button
                    onClick={() => setEmailOtpSent(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showChangePassword && (
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Change Password</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded border px-4 py-2"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border px-4 py-2"
              />
              <input
                type="password"
                placeholder="Retype New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border px-4 py-2"
              />
              <button
                onClick={sendPasswordOtp}
                className="rounded bg-[#4f6fa5] px-4 py-2 text-white hover:bg-[#3f5b89] transition"
              >
                Send OTP to Email
              </button>

              {passwordOtpSent && (
                <div className="space-y-2">
                  <input
                    placeholder="Enter OTP"
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value)}
                    className="w-full rounded border px-4 py-2"
                  />
                  <button
                    onClick={verifyPasswordOtp}
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
                  >
                    Verify OTP and Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
                <div>
                  <input
                    placeholder="House Number"
                    value={addr.house_number}
                    onChange={(e) =>
                      handleAddressChange(index, "house_number", e.target.value)
                    }
                    onBlur={(e) => validateAddressField(index, "house_number", e.target.value)}
                    className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"} ${addressErrors[index]?.house_number ? "border-red-500" : ""}`}
                    disabled={!editingAddresses}
                  />
                  {addressErrors[index]?.house_number && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors[index].house_number}</p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Street"
                    value={addr.street}
                    onChange={(e) =>
                      handleAddressChange(index, "street", e.target.value)
                    }
                    onBlur={(e) => validateAddressField(index, "street", e.target.value)}
                    className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"} ${addressErrors[index]?.street ? "border-red-500" : ""}`}
                    disabled={!editingAddresses}
                  />
                  {addressErrors[index]?.street && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors[index].street}</p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Barangay"
                    value={addr.barangay}
                    onChange={(e) =>
                      handleAddressChange(index, "barangay", e.target.value)
                    }
                    onBlur={(e) => validateAddressField(index, "barangay", e.target.value)}
                    className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"} ${addressErrors[index]?.barangay ? "border-red-500" : ""}`}
                    disabled={!editingAddresses}
                  />
                  {addressErrors[index]?.barangay && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors[index].barangay}</p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="City"
                    value={addr.city}
                    onChange={(e) =>
                      handleAddressChange(index, "city", e.target.value)
                    }
                    onBlur={(e) => validateAddressField(index, "city", e.target.value)}
                    className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"} ${addressErrors[index]?.city ? "border-red-500" : ""}`}
                    disabled={!editingAddresses}
                  />
                  {addressErrors[index]?.city && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors[index].city}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <input
                    placeholder="Zip Code"
                    value={addr.zip_code}
                    onChange={(e) =>
                      handleAddressChange(index, "zip_code", e.target.value)
                    }
                    onBlur={(e) => validateAddressField(index, "zip_code", e.target.value)}
                    className={`rounded border px-4 py-2 disabled:bg-gray-100 ${editingAddresses ? "text-black" : "text-gray-500"} ${addressErrors[index]?.zip_code ? "border-red-500" : ""}`}
                    disabled={!editingAddresses}
                  />
                  {addressErrors[index]?.zip_code && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors[index].zip_code}</p>
                  )}
                </div>
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