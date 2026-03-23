/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const fileInputRef = useRef(null);

  const [deliveryMode, setDeliveryMode] = useState("pickup");
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [showTerms, setShowTerms] = useState(false);

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

      alert(`Order placed! Your Order ID is ${orderId}`);
      clearCart();
      resetFileInput();
      navigate("/");

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
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-100"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-12">

          {/* LEFT COLUMN */}
          <div className="md:col-span-7 space-y-6">

            {/* 1. Delivery Method */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">1. Delivery Method</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMode("pickup")}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm font-medium transition ${
                    deliveryMode === "pickup"
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMode("delivery")}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm font-medium transition ${
                    deliveryMode === "delivery"
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
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
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">2. Contact Details</h2>
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Full Name</label>
                    <input
                      readOnly
                      value={userName}
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Email</label>
                    <input
                      readOnly
                      value={userEmail}
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Contact Number</label>
                  </div>
                  <input
                    readOnly
                    value={userPhone}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* ── Delivery Address ── */}
                {deliveryMode === "delivery" && (
                  <div className="space-y-3">
                    <label className="text-xs text-gray-400">Delivery Address *</label>

                    
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
                              : "border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-rose-500"
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
                              : "border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-rose-500"
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
                      className="text-xs text-rose-500 underline hover:text-rose-600 transition"
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
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">3. Payment</h2>
              <div className="space-y-4">

                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-2 h-40 w-40 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-2">
                      <img
                        src="http://localhost:8000/storage/qr_payment.jpg"
                        alt="GCash QR"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Scan to pay</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Payment Method *</label>
                    <span className="text-xs text-gray-400">{paymentMethod.length}/50</span>
                  </div>
                  <input
                    value={paymentMethod}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) setPaymentMethod(e.target.value);
                    }}
                    placeholder="e.g. GCash, PayMaya, BDO, BPI"
                    maxLength={50}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      errors.paymentMethod
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                        : "border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-rose-500"
                    }`}
                  />
                  {errors.paymentMethod && <p className="mt-1 text-xs text-red-500">{errors.paymentMethod}</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Reference Code *</label>
                    <span className="text-xs text-gray-400">{referenceCode.length}/30</span>
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
                        : "border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-rose-500"
                    }`}
                  />
                  {errors.referenceCode && <p className="mt-1 text-xs text-red-500">{errors.referenceCode}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-400">Payment Screenshot *</label>
                  <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-6 transition hover:bg-gray-100">
                    <span className="text-2xl">📎</span>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> screenshot
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG (MAX. 2MB)</p>
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
          <div className="md:col-span-5">
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Order Summary</h3>

              <div className="mb-4 max-h-64 overflow-y-auto pr-2 space-y-3">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <div className="flex gap-3">
                        <span className="font-medium text-gray-600 text-xs h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
                          {item.quantity}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-700">{item.name}</span>
                          {item.type === "custom" && (
                            <span className="text-[10px] text-gray-400">Custom Bouquet</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-500 flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    {item.greetingCard && (
                      <div className="ml-8 flex items-start gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1.5">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-rose-500">Greeting Card · <span className="font-normal">+₱5</span></p>
                          <p className="text-[10px] text-gray-400 break-words line-clamp-2">{item.greetingCard}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-dashed border-gray-200" />

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-gray-400">
                    {deliveryMode === "delivery" ? "Third-Party Delivery" : "Free (Pickup)"}
                  </span>
                </div>
              </div>

              <div className="my-4 border-t border-gray-200" />

              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-rose-500">₱{GRAND_TOTAL.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={!paymentProof || isSubmitting}
                className={`mt-6 w-full rounded-xl py-4 text-sm font-semibold text-white shadow transition
                  ${paymentProof && !isSubmitting
                    ? "bg-rose-500 hover:bg-rose-600 active:scale-95"
                    : "cursor-not-allowed bg-gray-300"
                  }`}
              >
                {isSubmitting ? "Placing Order..." : paymentProof ? "Complete Order" : "Upload Payment to Proceed"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                By placing this order, you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="underline text-rose-400 hover:text-rose-500 transition"
                >
                  terms of service
                </button>
                .
              </p>
            </div>
          </div>
        </form>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Terms & Conditions</h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 text-sm text-gray-600 space-y-4">

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

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="rounded-xl bg-rose-500 px-6 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CheckoutPage;