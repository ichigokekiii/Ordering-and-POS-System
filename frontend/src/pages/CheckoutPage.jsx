import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext"; // Assuming this path exists based on your files

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [deliveryMode, setDeliveryMode] = useState("pickup"); 
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Constants
  const DELIVERY_FEE = deliveryMode === "delivery" ? 50 : 0; // Example fee: 50
  const GRAND_TOTAL = totalPrice + DELIVERY_FEE;

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      // Create a temporary URL to preview the uploaded image
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!paymentProof) {
      alert("Please upload your payment screenshot to proceed.");
      return;
    }

    // Logic to send data to backend would go here
    console.log("Order Submitted:", { ...formData, deliveryMode, cartItems, paymentProof });
    
    alert("Order placed successfully! We will verify your payment.");
    clearCart();
    navigate("/"); // Redirect home or to a success page
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header with Back Button */}
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
          
          {/* LEFT COLUMN: Details & Payment */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Delivery Mode */}
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
            </div>

            {/* 2. Customer Details */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">2. Contact Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <input
                    required
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                
                {deliveryMode === "delivery" && (
                  <textarea
                    required
                    name="address"
                    placeholder="Complete Delivery Address"
                    rows="2"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                )}
                
                <textarea
                  name="notes"
                  placeholder="Special instructions or notes (optional)"
                  rows="2"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* 3. Payment Section */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-700">3. Payment (GCash)</h2>
              
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* QR Code Display */}
                <div className="flex flex-col items-center">
                  <div className="mb-2 h-40 w-40 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-2">
                    {/* REPLACE THE SRC BELOW WITH YOUR ACTUAL GCASH QR IMAGE */}
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                      alt="GCash QR" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Scan to pay</p>
                </div>

                {/* Upload Section */}
                <div className="flex-1 w-full">
                  <div className="mb-2 text-sm text-gray-600">
                    <p>Total Amount: <span className="font-bold text-rose-500">₱{GRAND_TOTAL.toLocaleString()}</span></p>
                    <p className="text-xs text-gray-400">Please attach a screenshot of your payment.</p>
                  </div>

                  <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-6 transition hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pb-2 pt-2">
                      <span className="text-2xl">📎</span>
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> screenshot
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>

                  {/* Preview of Uploaded File */}
                  {paymentProof && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-green-50 p-2">
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="h-10 w-10 rounded object-cover" />
                      )}
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-green-700">
                          {paymentProof.name}
                        </p>
                        <p className="text-xs text-green-600">Ready to submit</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="md:col-span-5">
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Order Summary</h3>
              
              {/* Receipt Items */}
              <div className="mb-4 max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <span className="font-medium text-gray-600 text-xs h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full">
                        {item.quantity}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-700">{item.name}</span>
                        {/* If custom, showing abbreviated details */}
                        {item.type === 'custom' && (
                           <span className="text-[10px] text-gray-400">Custom Bouquet</span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500">₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-dashed border-gray-200"></div>

              {/* Calculations */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{DELIVERY_FEE === 0 ? "Free" : `₱${DELIVERY_FEE}`}</span>
                </div>
              </div>

              <div className="my-4 border-t border-gray-200"></div>

              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-rose-500">₱{GRAND_TOTAL.toLocaleString()}</span>
              </div>

              {/* Checkout Button */}
              <button
                type="submit"
                disabled={!paymentProof}
                className={`mt-6 w-full rounded-xl py-4 text-sm font-semibold text-white shadow transition 
                  ${paymentProof 
                    ? "bg-rose-500 hover:bg-rose-600 active:scale-95" 
                    : "cursor-not-allowed bg-gray-300"
                  }`}
              >
                {paymentProof ? "Complete Order" : "Upload Payment to Proceed"}
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