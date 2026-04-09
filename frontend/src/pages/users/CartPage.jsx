import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useSchedules } from "../../contexts/ScheduleContext";
import {
  formatCustomSelection,
  getCustomOrderSummary,
} from "../../utils/customOrderSummary";

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, selectedScheduleId } = useCart();
  const { schedules } = useSchedules();
  const navigate = useNavigate();
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId);

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[90vh] flex-col items-center justify-center gap-4 bg-[#fcfaf9] px-8">
        <div className="rounded-full border border-gray-200 bg-white p-5 shadow-sm">
          <ShoppingCart className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-3xl font-playfair font-bold text-gray-900 mt-4">Your cart is empty</h2>
        <p className="text-sm uppercase tracking-widest font-semibold text-gray-400">Discover our floral collection</p>
        <button
          onClick={() => navigate("/schedule")}
          className="mt-6 rounded-full bg-gray-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#4f6fa5] hover:shadow-lg active:scale-95"
        >
          Begin your journey
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf9] px-4 py-8 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <button
              onClick={() => navigate("/order")}
              className="mb-4 flex items-center justify-center h-10 w-10 text-xl rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors"
              title="Go Back"
            >
              ←
            </button>
            <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-xs mb-1">Make it yours</p>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900">Your Cart</h2>
            {selectedSchedule && (
              <p className="mt-3 text-sm text-gray-500">
                Ordering for <span className="font-semibold text-gray-900">{selectedSchedule.schedule_name}</span>
              </p>
            )}
          </div>
          <button
            onClick={clearCart}
            className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-transparent hover:border-gray-900 hover:text-gray-900 transition-all pb-0.5"
          >
            Clear cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left Column: Cart Items */}
          <div className="flex-1 space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">{totalItems} Item{totalItems !== 1 ? "s" : ""} selected</h3>
            {cartItems.map((item) => {
              const customSummary =
                item.type === "custom" ? getCustomOrderSummary(item) : null;

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start gap-5">
                  {/* Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
                    <img
                      src={`http://localhost:8000${item.image}`}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-playfair font-bold text-xl text-gray-900 truncate">{item.name}</h3>
                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {item.type === "custom" && (
                         <span className="inline-block mt-1 mb-2 rounded bg-[#4f6fa5]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#4f6fa5]">
                           Custom Structure
                         </span>
                      )}

                      {/* Item Breakdown or Description */}
                      {item.type === "custom" && customSummary ? (
                        <div className="mt-3 space-y-2">
                          {customSummary.bouquet && (
                            <div className="rounded-2xl border border-[#4f6fa5]/10 bg-[#4f6fa5]/5 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5]">
                                Wrapper
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {customSummary.bouquet.name}
                              </p>
                            </div>
                          )}

                          <div className="grid gap-2 md:grid-cols-3">
                            <div className="rounded-2xl bg-gray-50 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Main Flowers
                              </p>
                              <p className="mt-1 text-xs font-medium text-gray-600">
                                {customSummary.mains.length > 0
                                  ? customSummary.mains
                                      .map(formatCustomSelection)
                                      .join(", ")
                                  : "Included count met"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Fillers
                              </p>
                              <p className="mt-1 text-xs font-medium text-gray-600">
                                {customSummary.fillers.length > 0
                                  ? customSummary.fillers
                                      .map(formatCustomSelection)
                                      .join(", ")
                                  : "Included count met"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Add-ons
                              </p>
                              <p className="mt-1 text-xs font-medium text-gray-600">
                                {customSummary.addOns.length > 0
                                  ? customSummary.addOns
                                      .map((entry) =>
                                        `${formatCustomSelection(entry)} (+₱${(
                                          entry.price * entry.quantity
                                        ).toLocaleString()})`
                                      )
                                      .join(", ")
                                  : "No extras added"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 truncate mt-1">{item.description}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-bold text-[#4f6fa5]">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </p>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full border border-gray-100 p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-[#4f6fa5]"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-[#4f6fa5]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Greeting Card Included Notice */}
                {item.greetingCard && (
                  <div className="mt-5 rounded-2xl border border-[#4f6fa5]/20 bg-[#4f6fa5]/5 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-1">Personal Touch Included (+₱5)</p>
                    <p className="text-xs text-gray-700 italic border-l-2 border-[#4f6fa5]/30 pl-3">"{item.greetingCard}"</p>
                  </div>
                )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[400px]">
             <div className="sticky top-10 rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
                <h3 className="mb-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
                  Summary
                </h3>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => {
                    const customSummary =
                      item.type === "custom" ? getCustomOrderSummary(item) : null;

                    return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold text-gray-600">
                        <span className="truncate pr-4">{item.name} <span className="text-xs text-gray-400 ml-1">x{item.quantity}</span></span>
                        <span className="flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      {customSummary?.bouquet && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5]">
                          {customSummary.bouquet.name}
                        </p>
                      )}
                      {item.greetingCard && (
                        <div className="flex justify-between text-[11px] font-medium text-[#4f6fa5] pl-2 border-l-2 border-[#4f6fa5]/20">
                          <span>Card included</span>
                          <span>+₱5</span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-6 mb-8 items-end">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Total</span>
                  <span className="text-3xl font-playfair font-bold text-gray-900">₱{totalPrice.toLocaleString()}</span>
                </div>

                <button
                  className="w-full rounded-2xl bg-gray-900 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#4f6fa5] hover:shadow-lg active:scale-95"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;
