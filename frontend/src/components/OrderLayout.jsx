import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useSchedules } from "../contexts/ScheduleContext";

function OrderLayout() {
  const {
    cartItems,
    selectedScheduleId,
    clearCart,
    clearSelectedSchedule,
  } = useCart();
  const { schedules, loading: schedulesLoading } = useSchedules();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");

  const shouldShowTools = !["/cart", "/checkout"].includes(location.pathname);
  const guardedOrderRoutes = [
    "/order",
    "/ordercustom",
    "/order/custom/additional",
    "/orderpremade",
    "/cart",
    "/checkout",
  ];
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
      clearCart(selectedScheduleId);
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

  return (
    <div className="min-h-screen bg-[#fcfaf9]">
      {shouldShowTools && (
        <div className="border-gray-100 bg-[#fcfaf9]">
          <div className="mx-auto flex max-w-7xl justify-center px-6 py-5 md:px-8">
            <div className="relative w-full max-w-3xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search flowers..."
                className="w-full rounded-full border border-gray-200 bg-white px-11 py-3 text-sm text-gray-700 shadow-sm transition-all focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#4f6fa5]/15"
              />
            </div>
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
