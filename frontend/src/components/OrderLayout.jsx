import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function OrderLayout() {
  const { totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  // clearCart only fires when OrderLayout itself unmounts —
  // meaning the user left /order, /orderpremade, /ordercustom, AND /cart entirely
  useEffect(() => {
    return () => {
      clearCart();
    };
  }, []);

  return (
    <>
      {/* Cart FAB lives here now, shared across all order pages */}
      <button
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl"
        onClick={() => navigate("/cart")}
      >
        <span className="text-2xl">🛒</span>
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      {/* Outlet renders whichever child route is active */}
      <Outlet />
    </>
  );
}

export default OrderLayout;