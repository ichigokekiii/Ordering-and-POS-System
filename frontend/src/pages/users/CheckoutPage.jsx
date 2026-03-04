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

  // Auto-filled from logged in user
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userId, setUserId] = useState(null);

  // Manual inputs
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Payment inputs
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  const GRAND_TOTAL = totalPrice;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const fullName = `${stored.first_name || ""} ${stored.last_name || ""}`.trim();
    setUserName(fullName);
    setUserEmail(stored.email || "");
    setUserPhone(stored.phone_number || "");
    setPhone(stored.phone_number || "");
    setUserId(stored.id || null);
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!phone.trim()) {
      newErrors.phone = "Contact number is required.";
    } else if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
      newErrors.phone = "Enter a valid phone number (7–15 digits).";
    }

    if (deliveryMode === "delivery") {
      if (!address.trim()) {
        newErrors.address = "Delivery address is required.";
      } else if (address.trim().length < 10) {
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
    if (file) {
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPaymentProof(null);
      setPreviewUrl(null);
    }
  };

  const resetFileInput = () => {
    setPaymentProof(null);
    setPreviewUrl(null);
    setFileInputKey(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const freshFile = fileInputRef.current?.files[0];

    if (!freshFile) {
      alert("Please upload your payment screenshot to proceed.");
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("user_id",          userId);
      formData.append("address",          deliveryMode === "pickup" ? "Pickup" : address);
      formData.append("phone",            phone);
      formData.append("delivery_method",  deliveryMode);
      formData.append("payment_method",   paymentMethod);
      formData.append("reference_number", referenceCode);
      formData.append("reference_image",  freshFile);
      formData.append("total_amount",     GRAND_TOTAL);
      formData.append("special_message",  "");

      const res = await api.post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`Order placed! Your Order ID is ${res.data.order_id}`);
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
                    value={phone}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {deliveryMode === "delivery" && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-400">Delivery Address *</label>
                      <span className="text-xs text-gray-400">{address.length}/200</span>
                    </div>
                    <textarea
                      rows="2"
                      value={address}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) setAddress(e.target.value);
                      }}
                      placeholder="Complete delivery address"
                      maxLength={200}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                        errors.address
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                          : "border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-rose-500"
                      }`}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
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
                    <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
                    <input
                      key={fileInputKey}
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>

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
                  <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <span className="font-medium text-gray-600 text-xs h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full">
                        {item.quantity}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-700">{item.name}</span>
                        {item.type === "custom" && (
                          <span className="text-[10px] text-gray-400">Custom Bouquet</span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500">₱{(item.price * item.quantity).toLocaleString()}</span>
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
                By placing this order, you agree to our terms of service.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;