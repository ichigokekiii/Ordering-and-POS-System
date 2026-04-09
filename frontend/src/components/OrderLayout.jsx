import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useSchedules } from "../contexts/ScheduleContext";

function OrderLayout() {
  const {
    totalItems,
    cartItems,
    totalPrice,
    selectedScheduleId,
    clearCart,
    clearSelectedSchedule,
  } = useCart();
  const { schedules, loading: schedulesLoading } = useSchedules();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const shouldShowTools = !["/cart", "/checkout"].includes(location.pathname);
  const guardedOrderRoutes = ["/order", "/ordercustom", "/orderpremade", "/cart", "/checkout"];
  const isGuardedRoute = guardedOrderRoutes.includes(location.pathname);
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId);

  useEffect(() => {
    if (!isGuardedRoute || schedulesLoading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduleDate = selectedSchedule?.event_date ? new Date(selectedSchedule.event_date) : null;
    if (scheduleDate) {
      scheduleDate.setHours(0, 0, 0, 0);
    }

    const isInvalidSchedule =
      !selectedSchedule ||
      selectedSchedule.isArchived ||
      !selectedSchedule.isAvailable ||
      !scheduleDate ||
      scheduleDate < today;

    if (!isInvalidSchedule) return;

    if (cartItems.length > 0) {
      clearCart();
    }

    clearSelectedSchedule();
    navigate("/schedule", {
      replace: true,
      state: {
        orderNoticeType: "error",
        orderNotice: selectedScheduleId
          ? "Your selected event is no longer available for ordering. Please choose another event."
          : "Choose an event before placing an order.",
      },
    });
  }, [
    cartItems.length,
    clearCart,
    clearSelectedSchedule,
    isGuardedRoute,
    navigate,
    schedulesLoading,
    selectedSchedule,
    selectedScheduleId,
  ]);

  const startPress = () => {
    longPressTriggered.current = false;
    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setIsCartOpen(true);
      pressTimer.current = null;
    }, 400);
  };

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (!longPressTriggered.current) {
      navigate("/cart");
    }

    longPressTriggered.current = false;
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    longPressTriggered.current = false;
  };

  return (
    <div className="min-h-screen bg-[#fcfaf9]">
      {shouldShowTools && (
        <div className="border-gray-100 bg-[#fcfaf9]">
          <div className="mx-auto flex max-w-7xl justify-end gap-3 px-6 py-5 md:px-8">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search flowers..."
                className="w-full rounded-full border border-gray-200 bg-white px-11 py-3 text-sm text-gray-700 shadow-sm transition-all focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#4f6fa5]/15"
              />
            </div>

            <button
              type="button"
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-[#4f6fa5] hover:text-[#4f6fa5] hover:shadow-md active:scale-95"
              onPointerDown={startPress}
              onPointerUp={endPress}
              onPointerCancel={cancelPress}
              onPointerLeave={cancelPress}
              title="Tap to view cart, press and hold for quick view"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -bottom-1 -right-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#4f6fa5] px-1 text-[10px] font-bold text-white ring-2 ring-[#fcfaf9]">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {isCartOpen && shouldShowTools && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-end bg-gray-900/10 backdrop-blur-sm sm:p-8"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-sm flex-col border border-gray-100 bg-white p-6 shadow-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-playfair font-bold text-gray-900">
                Your Cart
              </h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close cart modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 flex-1 space-y-4 overflow-y-auto pr-2">
              {cartItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={`http://localhost:8000${item.image}`}
                        alt={item.name}
                        className="h-12 w-12 rounded-full border border-gray-100 object-cover"
                      />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-white text-[10px] font-bold text-gray-700 shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate pr-2 text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <span>₱{item.price.toLocaleString()}</span>
                        {item.type === "custom" && (
                          <span className="rounded bg-[#4f6fa5]/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#4f6fa5]">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="mb-5 flex items-end justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Total Selection
                  </span>
                  <span className="text-3xl font-playfair font-bold text-gray-900">
                    ₱{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate("/cart");
                    }}
                    className="rounded-full bg-[#4f6fa5]/10 py-3.5 text-xs font-bold uppercase tracking-widest text-[#4f6fa5] transition-colors hover:bg-[#4f6fa5]/20"
                  >
                    Edit Cart
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate("/checkout");
                    }}
                    className="rounded-full bg-gray-900 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#4f6fa5]"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pb-24">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </div>
    </div>
  );
}

export default OrderLayout;
