/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavbar } from "../../contexts/NavbarContext";
import { useTheme } from "../../contexts/ThemeContext";
import { MapPin, Package, Plus, CheckCircle2, X, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

export default function ProfilePage() {
  const { updateUser, logoutUser } = useNavbar();
  const { themePreference, setThemePreference } = useTheme();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountDisabledModal, setAccountDisabledModal] = useState(false);

  // --- Modal System (replaces all alert/confirm) ---
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: "success", message: "" });
  const [cancelConfirm, setCancelConfirm] = useState({ isOpen: false, orderId: null });
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const [removeAddressConfirm, setRemoveAddressConfirm] = useState({ isOpen: false, index: null });

  // Navigation State
  const [activeTab, setActiveTab] = useState("profile");

  // --- Profile State ---
  const [editingProfile, setEditingProfile] = useState(false);

  // --- Address State ---
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ house_number: "", street: "", barangay: "", city: "", zip_code: "" });

  // --- Security State ---
  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);

  // Helper to show status modal
  const showAlert = (type, message) => setStatusModal({ isOpen: true, type, message });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      setAddresses(res.data.addresses || []);
      setOrders(res.data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile", err);
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CANCEL ORDER LOGIC
  // -------------------------------------------------------------
  const canCancelOrder = (order) => {
    const status = order.order_status?.toLowerCase();
    if (!["pending", "processing"].includes(status)) return false;
    if (!order.event_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(order.event_date);
    eventDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  };

  const cancelOrderCustomer = async () => {
  const orderId = cancelConfirm.orderId;
  setCancelConfirm({ isOpen: false, orderId: null });
  try {
    const res = await api.post(`/orders/${orderId}/cancel`);

    if (res.data?.account_disabled) {
      // Show the disabled modal first, THEN log out after user clicks OK
      setAccountDisabledModal(true);
    } else {
      showAlert("success", "Your order has been cancelled. A confirmation email has been sent to you.");
      fetchProfile();
    }
  } catch (err) {
    showAlert("error", err.response?.data?.message || "Failed to cancel order.");
  }
};

  // -------------------------------------------------------------
  // PROFILE LOGIC
  // -------------------------------------------------------------
  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const saveProfile = async () => {
    try {
      const res = await api.put("/profile", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
      });
      if (res.data && res.data.user) updateUser(res.data.user);
      setEditingProfile(false);
      fetchProfile();
      showAlert("success", "Personal information updated successfully.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update personal information.");
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/profile");
      setDeleteAccountConfirm(false);
      logoutUser();
      window.location.href = "/login";
    } catch (err) {
      setDeleteAccountConfirm(false);
      showAlert("error", err.response?.data?.message || "Failed to delete account.");
    }
  };

  // -------------------------------------------------------------
  // ADDRESSES LOGIC
  // -------------------------------------------------------------
  const handleAddressFormChange = (e) => setAddressForm({ ...addressForm, [e.target.name]: e.target.value });

  const saveAddress = async () => {
    if (!addressForm.house_number || !addressForm.street || !addressForm.barangay || !addressForm.city || !addressForm.zip_code) {
      showAlert("error", "All address fields are required.");
      return;
    }

    let updatedAddresses = [...addresses];
    if (editingAddressIndex === -1) {
      updatedAddresses.push(addressForm);
    } else {
      updatedAddresses[editingAddressIndex] = addressForm;
    }

    try {
      await api.put("/profile", { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setEditingAddressIndex(null);
      setShowAddressModal(false);
      fetchProfile();
      showAlert("success", "Address saved successfully.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to save address.");
    }
  };

  const confirmRemoveAddress = async () => {
    const index = removeAddressConfirm.index;
    const updated = addresses.filter((_, i) => i !== index);
    try {
      await api.put("/profile", { addresses: updated });
      setAddresses(updated);
      setRemoveAddressConfirm({ isOpen: false, index: null });
      fetchProfile();
      showAlert("success", "Address removed successfully.");
    } catch {
      setRemoveAddressConfirm({ isOpen: false, index: null });
      showAlert("error", "Failed to remove address.");
    }
  };

  const openAddressEditor = (index) => {
    if (index === -1) {
      setAddressForm({ house_number: "", street: "", barangay: "", city: "", zip_code: "" });
      setEditingAddressIndex(-1);
    } else {
      setAddressForm({ ...addresses[index] });
      setEditingAddressIndex(index);
    }
    setShowAddressModal(true);
  };

  // -------------------------------------------------------------
  // SECURITY LOGIC
  // -------------------------------------------------------------
  const sendEmailOtp = async () => {
    if (!newEmail || newEmail === profile.email) return showAlert("error", "Enter a valid new email address.");
    try {
      await api.post("/profile/email-otp", { email: newEmail.trim() });
      setEmailOtpSent(true);
      showAlert("success", "OTP sent to your new email address.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const verifyEmailOtp = async () => {
    try {
      const res = await api.post("/profile/email-verify", { email: newEmail.trim(), otp: emailOtp.trim() });
      setEmailChangeMode(false);
      setEmailOtpSent(false);
      fetchProfile();
      if (res.data?.email) updateUser({ ...profile, email: res.data.email });
      showAlert("success", "Email address updated successfully.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to verify OTP.");
    }
  };

  const sendPasswordOtp = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      return showAlert("error", "Please check your password inputs. Make sure new passwords match.");
    }
    try {
      await api.post("/profile/password-otp");
      setPasswordOtpSent(true);
      showAlert("success", "OTP sent to your email address.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const verifyPasswordOtp = async () => {
    try {
      await api.post("/profile/password-verify", {
        otp: passwordOtp.trim(),
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      showAlert("success", "Password changed successfully.");
      setPasswordOtpSent(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordOtp("");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to verify OTP.");
    }
  };

  // -------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf9] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Profile...</span>
      </div>
    );
  }

  // Helper for Order Status colors
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending")                        return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === "processing")                     return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "shipped")                        return "bg-purple-100 text-purple-700 border-purple-200";
    if (s === "delivered" || s === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "cancelled")                      return "bg-rose-100 text-rose-700 border-rose-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-[#fcfaf9] text-gray-900 font-sans pt-0 pb-0">
      <div className="w-full">
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">

          {/* ================= SIDEBAR ================= */}
          <div className="md:w-[260px] flex-shrink-0">
            <div className="bg-white border-r border-gray-100 shadow-sm p-6 h-full w-full">
              <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-6">My Account</h1>
              <nav className="flex flex-col gap-2 mt-4">
                {["profile", "addresses", "orders", "settings"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg w-full ${
                      activeTab === tab
                        ? "bg-[#0f1b2d] text-white"
                        : "text-gray-500 hover:bg-gray-100 hover:text-[#0f1b2d]"
                    }`}
                  >
                    {tab === "profile"   && "My Profile"}
                    {tab === "addresses" && "Addresses"}
                    {tab === "orders"    && "My Orders"}
                    {tab === "settings"  && "Account Settings"}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="flex-grow px-6 md:px-12 pt-24 pb-16">
            <AnimatePresence mode="wait">

              {/* --- MY PROFILE VIEW --- */}
              {activeTab === "profile" && (
                <MotionDiv key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">

                  {/* Personal Information */}
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-playfair font-bold text-gray-900">Personal Information</h3>
                      {!editingProfile && (
                        <button onClick={() => setEditingProfile(true)} className="text-xs font-semibold border border-gray-900 px-4 py-2 rounded-full bg-white text-gray-900 hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out">
                          Edit Info
                        </button>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-[#c0795c] flex items-center justify-center text-white text-lg font-bold shadow-inner">
                          {profile.first_name?.[0]}
                        </div>
                        <button className="text-xs font-semibold border border-gray-900 px-4 py-2 rounded-full bg-white text-gray-900 hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out">
                          Change Photo
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                          <input name="first_name" value={profile.first_name} onChange={handleProfileChange} disabled={!editingProfile} className={`w-full border ${editingProfile ? "border-gray-300 focus:border-[#3b82f6]" : "border-gray-200 bg-gray-50"} rounded-xl px-3 py-2 text-sm text-gray-800 outline-none transition-colors`} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                          <input name="last_name" value={profile.last_name} onChange={handleProfileChange} disabled={!editingProfile} className={`w-full border ${editingProfile ? "border-gray-300 focus:border-[#3b82f6]" : "border-gray-200 bg-gray-50"} rounded-xl px-3 py-2 text-sm text-gray-800 outline-none transition-colors`} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                          <input name="phone_number" value={profile.phone_number} onChange={handleProfileChange} disabled={!editingProfile} className={`w-full border ${editingProfile ? "border-gray-300 focus:border-[#3b82f6]" : "border-gray-200 bg-gray-50"} rounded-xl px-3 py-2 text-sm text-gray-800 outline-none transition-colors`} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                          {!emailChangeMode ? (
                            <div className="flex gap-2">
                              <input value={profile.email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none" />
                              <button onClick={() => setEmailChangeMode(true)} className="text-xs font-semibold border border-gray-900 px-4 py-2 rounded-full bg-white text-gray-900 hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out">
                                Change
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New Email Address" className="w-full border border-gray-300 focus:border-[#3b82f6] rounded-xl px-3 py-2 text-sm text-gray-800 outline-none" />
                              {!emailOtpSent ? (
                                <div className="flex gap-2">
                                  <button onClick={sendEmailOtp} className="bg-[#0f1b2d] text-white border border-[#0f1b2d] px-3 py-1.5 rounded-full font-medium text-xs hover:bg-white hover:text-[#0f1b2d] transition-all duration-300 ease-out">Verify</button>
                                  <button onClick={() => setEmailChangeMode(false)} className="text-gray-500 font-medium text-xs border border-gray-900 px-4 py-2 rounded-full bg-white text-gray-900 hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-2 items-center">
                                  <input type="text" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="000000" className="w-full flex-grow border border-gray-300 focus:border-[#3b82f6] rounded-xl px-3 py-1.5 text-center tracking-widest text-sm outline-none" maxLength="6" />
                                  <button onClick={verifyEmailOtp} className="bg-[#0f1b2d] text-white border border-[#0f1b2d] px-3 py-1.5 rounded-full font-medium text-xs hover:bg-white hover:text-[#0f1b2d] transition-all duration-300 ease-out">Done</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {editingProfile && (
                        <div className="mt-6 flex gap-3">
                          <button onClick={saveProfile} className="bg-[#0f1b2d] text-white border border-[#0f1b2d] px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-out hover:bg-white hover:text-[#0f1b2d]">Save</button>
                          <button onClick={() => setEditingProfile(false)} className="px-6 py-2 rounded-full font-medium text-sm text-gray-900 border border-gray-900 bg-white hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out">Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-playfair font-bold text-gray-900">Change Password</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Old Password</label>
                          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter password" className="w-full border border-gray-200 focus:border-[#3b82f6] rounded-xl px-3 py-2 text-sm text-gray-800 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full border border-gray-200 focus:border-[#3b82f6] rounded-xl px-3 py-2 text-sm text-gray-800 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm Password</label>
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full border border-gray-200 focus:border-[#3b82f6] rounded-xl px-3 py-2 text-sm text-gray-800 outline-none" />
                        </div>
                      </div>
                      {!passwordOtpSent ? (
                        <button onClick={sendPasswordOtp} className="bg-[#0f1b2d] text-white border border-[#0f1b2d] px-4 py-2 rounded-full font-medium text-xs hover:bg-white hover:text-[#0f1b2d] transition-all duration-300 ease-out">Send OTP</button>
                      ) : (
                        <div className="flex gap-3 items-center mt-2 max-w-sm">
                          <input type="text" placeholder="OTP" value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} className="w-32 border border-gray-300 rounded-xl px-3 py-2 tracking-widest text-center focus:border-[#3b82f6] outline-none text-sm" maxLength="6" />
                          <button onClick={verifyPasswordOtp} className="bg-[#0f1b2d] text-white border border-[#0f1b2d] px-4 py-2 rounded-full font-medium text-xs hover:bg-white hover:text-[#0f1b2d] transition-all duration-300 ease-out">Verify & Update</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Control */}
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div>
                        <h3 className="font-playfair font-bold text-gray-900">Account Control</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage your account lifecycle.</p>
                      </div>
                      <button onClick={() => setDeleteAccountConfirm(true)} className="text-xs font-semibold text-red-600 border border-red-500 px-4 py-2 rounded-full bg-white hover:bg-red-600 hover:text-white transition-all duration-300 ease-out">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              )}

              {/* --- ACCOUNT SETTINGS VIEW --- */}
              {activeTab === "settings" && (
                <MotionDiv key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-playfair font-bold text-gray-900">Preferences</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Theme</label>
                          <select value={themePreference} onChange={(e) => setThemePreference(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-[#3b82f6] outline-none">
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                            <option value="system">System Default</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Size</label>
                          <select defaultValue="medium" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-[#3b82f6] outline-none">
                            <option>Small</option>
                            <option value="medium">Medium</option>
                            <option>Large</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Animations</label>
                          <select defaultValue="enabled" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-[#3b82f6] outline-none">
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              )}

              {/* --- ADDRESSES VIEW --- */}
              {activeTab === "addresses" && (
                <MotionDiv key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-playfair font-bold text-gray-900">Saved Addresses</h3>
                      {editingAddressIndex === null && addresses.length < 3 && (
                        <button onClick={() => openAddressEditor(-1)} className="text-xs font-semibold border border-gray-900 px-4 py-2 rounded-full bg-white text-gray-900 hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out flex items-center gap-1">
                          <Plus size={14} /> Add Address
                        </button>
                      )}
                    </div>
                    {editingAddressIndex === null ? (
                      <div className="p-6 flex flex-col gap-4">
                        {addresses.length === 0 ? (
                          <div className="text-center py-8">
                            <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">No saved addresses yet.</p>
                          </div>
                        ) : (
                          addresses.map((addr, idx) => (
                            <div key={idx} className="group border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row gap-5 bg-white hover:border-gray-300 transition-all">
                              <div className="flex-grow flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-sm text-gray-900">{profile.first_name} {profile.last_name}</h4>
                                  <div className="flex gap-2">
                                    <button onClick={() => openAddressEditor(idx)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => setRemoveAddressConfirm({ isOpen: true, index: idx })} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{profile.phone_number}</p>
                                <p className="text-sm text-gray-700 leading-relaxed max-w-lg">
                                  {addr.house_number} {addr.street}, {addr.barangay}, {addr.city}, Zip {addr.zip_code}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </MotionDiv>
              )}

              {/* --- ORDERS VIEW --- */}
              {activeTab === "orders" && (
                <MotionDiv key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-playfair font-bold text-gray-900">Order History</h3>
                    </div>
                    <div className="p-6">
                      {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Package className="w-12 h-12 text-gray-300 mb-4" />
                          <h3 className="font-playfair font-bold text-gray-900 mb-1">No Orders Found</h3>
                          <p className="text-sm text-gray-500 max-w-sm">You haven't placed any orders yet. Visit our Showcase to get started.</p>
                          <button onClick={() => (window.location.href = "/")} className="mt-6 bg-[#0f1b2d] text-white border border-[#0f1b2d] px-6 py-2 rounded-full font-medium text-sm hover:bg-white hover:text-[#0f1b2d] transition-all duration-300 ease-out">
                            Shop Now
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div
                              key={order.order_id || order.id}
                              className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 hover:border-gray-300 transition-colors bg-gray-50/50"
                            >
                              <div>
                                <p className="font-bold text-gray-900 text-sm mb-1">Order #{order.order_id || order.id}</p>
                                <p className="text-xs text-gray-500 mb-3">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                <div className="mb-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Schedule</p>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {order.schedule_name || order.schedule?.schedule_name || "Legacy / Unlinked event"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order.event_date ? new Date(order.event_date).toLocaleDateString() : "No linked event date"}
                                  </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(order.order_status)}`}>
                                  {order.order_status || "Pending"}
                                </span>
                              </div>
                              <div className="text-left md:text-right flex flex-col justify-between gap-3">
                                <div>
                                  <p className="font-bold text-[#4f6fa5] text-lg">₱{order.total_amount}</p>
                                  <p className="text-xs text-gray-500 capitalize">{order.delivery_method} Delivery</p>
                                </div>
                                {canCancelOrder(order) && (
                                  <button
                                    onClick={() => setCancelConfirm({ isOpen: true, orderId: order.order_id || order.id })}
                                    className="text-xs font-semibold text-red-600 border border-red-400 px-4 py-1.5 rounded-full bg-white hover:bg-red-600 hover:text-white transition-all duration-300 ease-out self-start md:self-end"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </MotionDiv>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* --- ACCOUNT DISABLED MODAL --- */}
{accountDisabledModal && (
  <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
    <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
        Account Locked
      </h3>
      <p className="text-sm text-gray-500 mb-2 px-2">
        Your account has been locked because our system flagged repeated cancellations as fraudulent buying behavior.
      </p>
      <p className="text-sm text-gray-500 mb-8 px-2">
        Please check your email for recovery steps, then contact IT support to restore access.
      </p>
      <button
        onClick={() => {
          setAccountDisabledModal(false);
          logoutUser();
          window.location.href = "/login";
        }}
        className="rounded-xl bg-gray-900 px-8 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm w-full"
      >
        Understood — Log Me Out
      </button>
    </div>
  </div>
)}

      {/* --- CANCEL ORDER CONFIRMATION --- */}
      {cancelConfirm.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <Package size={28} />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Cancel Order?</h3>
            <p className="text-sm text-gray-500 mb-4 px-2">
              Are you sure you want to cancel Order <span className="font-semibold text-gray-700">#{cancelConfirm.orderId}</span>? This action cannot be undone.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs text-amber-700 font-semibold mb-0.5">⚠️ Please be mindful</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Repeated cancellations increase your priority risk level. Every 2 consecutive cancellations raises the flag, and reaching Priority 3 locks the account.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setCancelConfirm({ isOpen: false, orderId: null })} className="rounded-xl px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                Keep Order
              </button>
              <button onClick={cancelOrderCustomer} className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-600 transition-all duration-300 shadow-sm">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE ACCOUNT CONFIRMATION --- */}
      {deleteAccountConfirm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <Trash2 size={28} />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-8 px-2">
              Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteAccountConfirm(false)} className="rounded-xl px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={deleteAccount} className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-600 transition-all duration-300 shadow-sm">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REMOVE ADDRESS CONFIRMATION --- */}
      {removeAddressConfirm.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <MapPin size={28} />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Remove Address?</h3>
            <p className="text-sm text-gray-500 mb-8 px-2">
              Are you sure you want to remove this address from your account?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setRemoveAddressConfirm({ isOpen: false, index: null })} className="rounded-xl px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={confirmRemoveAddress} className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-600 transition-all duration-300 shadow-sm">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STATUS ALERT MODAL --- */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[400] p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${statusModal.type === "success" ? "bg-emerald-100 text-emerald-500" : "bg-rose-100 text-rose-500"}`}>
              {statusModal.type === "success" ? <CheckCircle2 size={28} /> : <X size={28} />}
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
              {statusModal.type === "success" ? "Success" : "Something went wrong"}
            </h3>
            <p className="text-sm text-gray-500 mb-8 px-2">{statusModal.message}</p>
            <div className="flex justify-center">
              <button
                onClick={() => setStatusModal({ isOpen: false, type: "success", message: "" })}
                className="rounded-xl bg-gray-900 px-8 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADDRESS FORM MODAL --- */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-xl p-6 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-playfair font-bold text-gray-900 mb-6">
              {editingAddressIndex === -1 ? "Add Address" : "Edit Address"}
            </h3>
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <input name="house_number" value={addressForm.house_number} onChange={handleAddressFormChange} placeholder="House / Unit No." className="w-full border-2 border-gray-900 rounded-xl px-3 py-2 text-sm focus:border-[#3b82f6] outline-none" />
              <input name="street" value={addressForm.street} onChange={handleAddressFormChange} placeholder="Street" className="w-full border-2 border-gray-900 rounded-xl px-3 py-2 text-sm focus:border-[#3b82f6] outline-none" />
              <input name="barangay" value={addressForm.barangay} onChange={handleAddressFormChange} placeholder="Barangay" className="w-full border-2 border-gray-900 rounded-xl px-3 py-2 text-sm focus:border-[#3b82f6] outline-none" />
              <input name="city" value={addressForm.city} onChange={handleAddressFormChange} placeholder="City" className="w-full border-2 border-gray-900 rounded-xl px-3 py-2 text-sm focus:border-[#3b82f6] outline-none" />
              <input name="zip_code" value={addressForm.zip_code} onChange={handleAddressFormChange} placeholder="Zip Code" className="w-full border-2 border-gray-900 rounded-xl px-3 py-2 text-sm md:col-span-2 focus:border-[#3b82f6] outline-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setEditingAddressIndex(null); setShowAddressModal(false); }}
                className="px-5 py-2 rounded-full text-sm text-gray-900 border border-gray-900 bg-white hover:bg-[#0f1b2d] hover:text-white transition-all duration-300 ease-out"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className="bg-[#0f1b2d] text-white border border-[#0f1b2d] px-6 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-[#0f1b2d] transition-all duration-300 ease-out"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
