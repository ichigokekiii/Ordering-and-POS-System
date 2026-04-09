import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";
import { useSchedules } from "../../contexts/ScheduleContext";
import {
  formatCustomSelection,
  getCustomOrderSummary,
} from "../../utils/customOrderSummary";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart, selectedScheduleId } = useCart();
  const { schedules } = useSchedules();
  const fileInputRef = useRef(null);
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId);

  const [deliveryMode, setDeliveryMode] = useState("pickup");
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [showTerms, setShowTerms] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // ── Success modal (same pattern as VerifyOtpPage) ──
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Auto-filled from logged in user
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userId, setUserId] = useState(null);

  // Manual inputs
  const [address, setAddress] = useState("");

  // Saved addresses from profile
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(""); // "" = unselected, number = saved, "manual" = manual
  const [useManualAddress, setUseManualAddress] = useState(false);

  // Payment inputs
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({ image: "" });

  const GRAND_TOTAL = totalPrice;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const fullName = `${stored.first_name || ""} ${stored.last_name || ""}`.trim();
    setUserName(fullName);
    setUserEmail(stored.email || "");
    setUserPhone(stored.phone_number || "");
    setUserId(stored.id || null);
  }, []);

  // Fetch saved addresses from profile
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get("/profile");
        setSavedAddresses(res.data.addresses || []);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };
    fetchAddresses();
  }, []);

  // Build a readable one-line string from a saved address object
  const formatAddress = (addr) =>
    [addr.house_number, addr.street, addr.barangay, addr.city, addr.zip_code]
      .filter(Boolean)
      .join(", ");

  // Resolve the final address string for submission
  const resolvedAddress = useManualAddress
    ? address
    : selectedAddressIndex !== "" && selectedAddressIndex !== "manual"
    ? formatAddress(savedAddresses[Number(selectedAddressIndex)])
    : address;

  const validate = () => {
    const newErrors = {};

    if (deliveryMode === "delivery") {
      const finalAddr = resolvedAddress.trim();
      if (!finalAddr) {
        newErrors.address = "Delivery address is required.";
      } else if (finalAddr.length < 10) {
        newErrors.address = "Please enter a more complete address (min 10 characters).";
      }
    }

    if (!paymentMethod.trim()) {
      newErrors.paymentMethod = "Payment method is required.";
    }

    if (!referenceCode.trim()) {
      newErrors.referenceCode = "Reference code is required.";
    } else if (!/^[a-zA-Z0-9]{4,30}$/.test(referenceCode)) {
      newErrors.referenceCode = "Reference code must be 4–30 alphanumeric characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPaymentProof(null);
      setPreviewUrl(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image must be under 2MB. Please compress it first." }));
      setPaymentProof(null);
      setPreviewUrl(null);
      setFileInputKey(prev => prev + 1);
      return;
    }
    setErrors(prev => ({ ...prev, image: "" }));
    setPaymentProof(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetFileInput = () => {
    setPaymentProof(null);
    setPreviewUrl(null);
    setFileInputKey(prev => prev + 1);
    setErrors(prev => ({ ...prev, image: "" }));
  };

  /**
   * Builds the order_items rows from the cart.
   */
  const buildOrderItems = (orderId) => {
    const rows = [];
    let customCounter = 0;
    let premadeCounter = 0;

    for (const cartItem of cartItems) {
      if (cartItem.type === "custom") {
        customCounter += 1;
        const customId = customCounter;
        const message = cartItem.greetingCard || null;

        for (let i = 0; i < cartItem.items.length; i++) {
          const flower = cartItem.items[i];
          rows.push({
            order_id:          orderId,
            product_id:        flower.id,
            product_name:      flower.name,
            custom_id:         customId,
            premade_id:        null,
            quantity:          flower.quantity ?? 1,
            price_at_purchase: flower.free
              ? 0
              : Number(flower.price) * (flower.quantity ?? 1),
            special_message:   i === 0 ? message : null,
          });
        }
      } else {
        premadeCounter += 1;
        rows.push({
          order_id:          orderId,
          product_id:        cartItem._productId ?? cartItem.id,
          product_name:      cartItem.name,
          custom_id:         null,
          premade_id:        premadeCounter,
          quantity:          cartItem.quantity,
          price_at_purchase: Number(cartItem.price) * cartItem.quantity,
          special_message:   cartItem.greetingCard || null,
        });
      }
    }

    return rows;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const freshFile = paymentProof;

    if (!freshFile) {
      alert("Please upload your payment screenshot to proceed.");
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("user_id",          userId);
      formData.append("schedule_id",      selectedScheduleId);
      formData.append("address",          deliveryMode === "pickup" ? "Pickup" : resolvedAddress);
      formData.append("delivery_method",  deliveryMode);
      formData.append("payment_method",   paymentMethod);
      formData.append("reference_number", referenceCode);
      formData.append("reference_image",  freshFile);
      formData.append("total_amount",     GRAND_TOTAL);
      formData.append("special_message",  "");

      const res = await api.post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const orderId = res.data.order_id;

      const orderItems = buildOrderItems(orderId);
      await api.post("/order-items", { items: orderItems });

      // ── Show success modal then navigate (same pattern as VerifyOtpPage) ──
      clearCart();
      resetFileInput();
      setModalMessage(`Order placed! Your Order ID is ${orderId}`);
      setShowModal(true);

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Order failed", error);
      console.error("Validation errors:", error.response?.data);
      alert("Something went wrong. Please try again.");
      resetFileInput();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf9] px-4 py-8 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-gray-200">
          <div>
            <button
              onClick={() => navigate("/cart")}
              className="mb-4 flex items-center justify-center h-10 w-10 text-xl rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors"
            >
              ←
            </button>
            <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-xs mb-1">Make it yours</p>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900">Checkout</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-8">

            {/* 1. Delivery Method */}
            {selectedSchedule && (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">Selected Event</h2>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-playfair font-bold text-gray-900">{selectedSchedule.schedule_name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(selectedSchedule.event_date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/schedule")}
                    className="rounded-full border border-gray-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-900 hover:bg-gray-900 hover:text-white transition-all"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">1. Delivery Method</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMode("pickup")}
                  className={`flex-1 rounded-2xl border py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                    deliveryMode === "pickup"
                      ? "border-[#4f6fa5] bg-[#4f6fa5]/5 text-[#4f6fa5] shadow-inner"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 shadow-sm hover:shadow"
                  }`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMode("delivery")}
                  className={`flex-1 rounded-2xl border py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                    deliveryMode === "delivery"
                      ? "border-[#4f6fa5] bg-[#4f6fa5]/5 text-[#4f6fa5] shadow-inner"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 shadow-sm hover:shadow"
                  }`}
                >
                  Delivery
                </button>
              </div>
              {deliveryMode === "delivery" && (
                <p className="mt-3 text-xs text-gray-400">
                  Delivery is handled by a third-party courier. Fees are settled separately.
                </p>
              )}
            </div>

            {/* 2. Contact Details */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">2. Contact Details</h2>
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-widest font-bold text-gray-400">Full Name</label>
                    <input
                      readOnly
                      value={userName}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-widest font-bold text-gray-400">Email</label>
                    <input
                      readOnly
                      value={userEmail}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Contact Number</label>
                  </div>
                  <input
                    readOnly
                    value={userPhone}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* ── Delivery Address ── */}
                {deliveryMode === "delivery" && (
                  <div className="space-y-4 pt-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Delivery Address *</label>

                    {!useManualAddress && (
                      <div className="relative">
                        <select
                          value={selectedAddressIndex}
                          onChange={(e) => {
                            setSelectedAddressIndex(e.target.value);
                            setErrors(prev => ({ ...prev, address: "" }));
                          }}
                          className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 ${
                            errors.address
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                              : "border-gray-200 bg-white focus:border-[#4f6fa5] focus:ring-[#4f6fa5]"
                          } ${selectedAddressIndex === "" ? "text-gray-400" : "text-gray-700"}`}
                        >
                          <option value="" disabled>
                            {savedAddresses.length === 0
                              ? "No saved addresses"
                              : "Select a saved address"}
                          </option>
                          {savedAddresses.map((addr, i) => (
                            <option key={i} value={i}>
                              {formatAddress(addr)}
                            </option>
                          ))}
                        </select>
                        {/* Chevron icon */}
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Manual input */}
                    {useManualAddress && (
                      <div>
                        <div className="flex justify-end mb-1">
                          <span className="text-xs text-gray-400">{address.length}/200</span>
                        </div>
                        <textarea
                          rows="2"
                          value={address}
                          onChange={(e) => {
                            if (e.target.value.length <= 200) setAddress(e.target.value);
                            setErrors(prev => ({ ...prev, address: "" }));
                          }}
                          placeholder="Enter your complete delivery address"
                          maxLength={200}
                          className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                            errors.address
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                              : "border-gray-200 bg-white focus:border-[#4f6fa5] focus:ring-[#4f6fa5]"
                          }`}
                        />
                      </div>
                    )}

                    {errors.address && (
                      <p className="text-xs text-red-500">{errors.address}</p>
                    )}

                    {/* Toggle between saved and manual */}
                    <button
                      type="button"
                      onClick={() => {
                        setUseManualAddress(prev => !prev);
                        setSelectedAddressIndex("");
                        setAddress("");
                        setErrors(prev => ({ ...prev, address: "" }));
                      }}
                      className="text-xs text-[#4f6fa5] font-semibold hover:underline transition"
                    >
                      {useManualAddress
                        ? "← Use a saved address instead"
                        : "Enter address manually instead"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Payment */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">3. Payment</h2>
              <div className="space-y-6">

                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => setShowQRModal(true)}>
                    <div className="h-40 w-40 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white p-3 shadow-sm hover:shadow transition-shadow group-hover:border-[#4f6fa5]/30">
                      <img
                        src="http://localhost:8000/storage/qr_payment.jpg"
                        alt="GCash QR"
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                         <span className="bg-white/90 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] shadow-sm">
                           Click to zoom
                         </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-widest font-bold text-[#4f6fa5]">Scan & Pay</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Payment Method *</label>
                  </div>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 ${
                        errors.paymentMethod
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                          : "border-gray-200 bg-white focus:border-[#4f6fa5] focus:ring-[#4f6fa5]"
                      } ${!paymentMethod ? "text-gray-400" : "text-gray-700"}`}
                    >
                      <option value="" disabled>Select Provider</option>
                      <option value="GCash">GCash</option>
                      <option value="Maya">Maya</option>
                      <option value="BPI">BPI</option>
                      <option value="BDO">BDO</option>
                      <option value="Other">Other Bank Transfer</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.paymentMethod && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.paymentMethod}</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Reference Code *</label>
                    <span className="text-[10px] text-gray-400 font-bold">{referenceCode.length}/30</span>
                  </div>
                  <input
                    value={referenceCode}
                    onChange={(e) => {
                      if (e.target.value.length <= 30) setReferenceCode(e.target.value);
                    }}
                    placeholder="Transaction reference code"
                    maxLength={30}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      errors.referenceCode
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                        : "border-gray-200 bg-white focus:border-[#4f6fa5] focus:ring-[#4f6fa5]"
                    }`}
                  />
                  {errors.referenceCode && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.referenceCode}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-widest font-bold text-gray-400">Payment Screenshot *</label>
                  <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 transition-colors hover:bg-white hover:border-[#4f6fa5]/50 group">
                    <span className="text-3xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">📎</span>
                    <p className="mt-3 mb-1 text-sm text-gray-600 font-medium">
                      Click to upload screenshot
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">PNG, JPG (MAX. 2MB)</p>
                    <input
                      key={fileInputKey}
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>

                  {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}

                  {paymentProof && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-green-50 p-2">
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="h-10 w-10 rounded object-cover" />
                      )}
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-green-700">{paymentProof.name}</p>
                        <p className="text-xs text-green-600">Ready to submit</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:w-[400px]">
            <div className="sticky top-10 rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
              <h3 className="mb-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
                Order Summary
              </h3>

              <div className="mb-6 max-h-[300px] overflow-y-auto pr-2 space-y-4 nice-scrollbar">
                {cartItems.map((item, index) => {
                  const customSummary =
                    item.type === "custom" ? getCustomOrderSummary(item) : null;

                  return (
                  <div key={`${item.id}-${index}`} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <div className="flex gap-3">
                        <span className="font-medium text-gray-600 text-xs h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
                          {item.quantity}
                        </span>
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-gray-900 font-semibold truncate">{item.name}</span>
                          {item.type === "custom" && (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#4f6fa5] mt-0.5">Custom Build</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-900 font-bold flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    {customSummary && (
                      <div className="ml-8 rounded-2xl bg-[#4f6fa5]/5 px-3 py-2">
                        {customSummary.bouquet && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5]">
                            Wrapper: <span className="font-semibold">{customSummary.bouquet.name}</span>
                          </p>
                        )}
                        <div className="mt-1 space-y-1 text-xs text-gray-600">
                          <p>
                            Main flowers:{" "}
                            {customSummary.mains.length > 0
                              ? customSummary.mains.map(formatCustomSelection).join(", ")
                              : "Included count met"}
                          </p>
                          <p>
                            Fillers:{" "}
                            {customSummary.fillers.length > 0
                              ? customSummary.fillers.map(formatCustomSelection).join(", ")
                              : "Included count met"}
                          </p>
                          {customSummary.addOns.length > 0 && (
                            <p>
                              Add-ons:{" "}
                              {customSummary.addOns
                                .map((entry) =>
                                  `${formatCustomSelection(entry)} (+₱${(
                                    entry.price * entry.quantity
                                  ).toLocaleString()})`
                                )
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {item.greetingCard && (
                      <div className="ml-8 flex items-start gap-1.5">
                        <div className="min-w-0 border-l-2 border-[#4f6fa5]/20 pl-2">
                          <p className="text-[10px] font-bold text-[#4f6fa5] uppercase tracking-widest">Card Included · <span className="font-bold">+₱5</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₱{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Delivery fee</span>
                  <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    {deliveryMode === "delivery" ? "Third-Party" : "Free pickup"}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-gray-100 pt-6 mb-8">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Total</span>
                <span className="text-3xl font-playfair font-bold text-[#4f6fa5]">₱{GRAND_TOTAL.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={!paymentProof || isSubmitting}
                className={`w-full rounded-2xl py-4 text-xs font-bold tracking-widest uppercase text-white shadow-md transition-all active:scale-95
                  ${paymentProof && !isSubmitting
                    ? "bg-gray-900 hover:bg-[#4f6fa5] hover:shadow-lg"
                    : "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none border border-gray-200"
                  }`}
              >
                {isSubmitting ? "Processing..." : paymentProof ? "Confirm Order" : "Upload proof to continue"}
              </button>

              <p className="mt-5 text-center text-[10px] uppercase tracking-widest font-bold text-gray-400">
                By placing this order, you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="underline text-[#4f6fa5] hover:text-[#4f6fa5]/80 transition"
                >
                  Terms of Service
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* ── Terms Modal ── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl max-h-[85vh] flex flex-col border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-playfair font-bold text-gray-900">Terms & Conditions</h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-[#4f6fa5] transition flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 hover:bg-[#4f6fa5]/10"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-4 text-sm text-gray-600 space-y-6 nice-scrollbar">

              <div>
                <h3 className="font-semibold text-gray-800 text-base mb-1">Customer Terms & Conditions</h3>
                <p className="text-xs text-gray-400 mb-3">
                  These terms and conditions act as the legal agreement for all external users accessing the Petal Express PH web platform.
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700">1. Introduction & Acceptance of Terms</p>
                    <p>Customers acknowledge that by using the service, they agree to abide by the specified usage and purchasing policies.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">2. Ordering and Payment Protocols</p>
                    <p>Orders are only confirmed upon validation of payment proof (screenshot and reference number).</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">3. Cancellation and Modification</p>
                    <p>Cancellation requests are prohibited within the 3-day window preceding a scheduled event.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">4. Account Security and Responsibilities</p>
                    <p>Users are responsible for their account credentials. The system enforces security protocols including account lockout procedures after failed login attempts.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">5. Electronic Communications</p>
                    <p>Customers grant consent for the system to use the Email API for order receipts, event notifications, and OTP verification during registration and reset flows.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">6. Product Customization Disclaimer</p>
                    <p>Custom orders involve manual creation and final results may vary based on flower and filler availability.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-2" />

              <div>
                <h3 className="font-semibold text-gray-800 text-base mb-1">Internal Operations Terms & Conditions</h3>
                <p className="text-xs text-gray-400 mb-3">
                  This document governs the behavior and responsibilities of personnel with administrative system access.
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700">1. Role-Based Access Control (RBAC)</p>
                    <p>IT and Owners maintain full CRUD capabilities, while Staff roles are limited to operational viewing and POS order processing.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">2. Administrative Security & Auth</p>
                    <p>Secure login practices are mandatory, including MFA (OTP) and strict limits on failed login attempts to prevent account hijacking.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">3. POS and Inventory Integrity</p>
                    <p>Staff must maintain accurate stock availability. Failure to properly process orders may result in discrepancies between the POS and inventory.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">4. CMS and Content Governance</p>
                    <p>IT and Owner actors must perform regular audits on published content. Unauthorized or erroneous changes must be corrected immediately to prevent misinformation.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">5. Schedule and Fulfillment Management</p>
                    <p>Staff must monitor event schedules accurately to ensure customers are correctly notified of pop-up dates and delivery timelines.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">6. Data Confidentiality</p>
                    <p>Sharing of administrative credentials is prohibited. Customer data collected during registration and checkout must be protected at all times.</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded-full bg-gray-900 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#4f6fa5] transition"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Zoom Modal ── */}
      {showQRModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowQRModal(false)}>
           <div className="relative max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
              <button
                className="absolute -top-12 right-0 text-white flex gap-2 items-center text-sm uppercase tracking-widest font-bold hover:text-[#4f6fa5] transition"
                onClick={() => setShowQRModal(false)}
              >
                Close ✕
              </button>
              <img
                 src="http://localhost:8000/storage/qr_payment.jpg"
                 alt="GCash QR Zoom"
                 className="w-full h-auto rounded-3xl shadow-2xl object-contain bg-white p-4"
              />
           </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm transform rounded-2xl bg-white p-6 text-center shadow-2xl transition-all animate-fade-in">

            {/* Success Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-7 w-7 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Message */}
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Success
            </h3>

            <p className="text-sm text-gray-600">
              {modalMessage}
            </p>

            {/* Loading indicator */}
            <div className="mt-4 flex justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5C6F9E] border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CheckoutPage;
