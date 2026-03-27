/* eslint-disable no-unused-vars */


import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash } from "lucide-react";

const formatPromoFillers = (fillers = []) =>
  Object.values(
    fillers.reduce((summary, filler) => {
      const key = filler.name;
      if (!summary[key]) {
        summary[key] = { name: filler.name, qty: 0 };
      }
      summary[key].qty += 1;
      return summary;
    }, {})
  )
    .map((filler) => `${filler.name} x${filler.qty}`)
    .join(", ");

function CartSection({
  cart,
  total,
  removeFromCart,
  clearCart,
  setMethodModal,
  dm,
  hasIncompleteBuilder,
}) {
  return (
    <div
      className={`w-[380px] flex flex-col z-10 border-l h-[100dvh] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] ${
        dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`h-16 px-4 border-b flex justify-between items-center flex-shrink-0 ${
          dm
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <h2
            className={`font-bold text-lg ${
              dm ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Cart
          </h2>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {cart.reduce((s, i) => s + i.qty, 0)}
          </span>
        </div>

        <button
          onClick={clearCart}
          className={`transition p-2 rounded-md ${
            dm
              ? "text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50"
              : "text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100"
          }`}
          title="Clear Cart"
        >
          <Trash size={18} />
        </button>
      </div>

      {/* Items */}
      <div
        className={`flex-1 overflow-x-hidden overflow-y-auto p-3 space-y-2 min-h-0 ${
          dm ? "bg-gray-900/30" : "bg-gray-50/50"
        }`}
      >
        {cart.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`h-full flex flex-col items-center justify-center p-6 text-center ${dm ? "text-gray-500" : "text-gray-400"}`}
          >
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>Tap an item to add to the transaction. Swipe left or right to delete an item.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -80, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative mb-2 rounded border shadow-sm overflow-hidden group ${
                  dm
                    ? "border-gray-700 bg-red-900/20"
                    : "border-gray-100 bg-red-50"
                }`}
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -60 || info.offset.x > 60) {
                      removeFromCart(item.cartId);
                    }
                  }}
                  whileDrag={{ scale: 0.96, opacity: 0.85 }}
                  className={`relative p-3 flex items-center justify-between z-10 w-full cursor-grab active:cursor-grabbing ${
                    dm ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex-1 pr-2 pointer-events-none select-none">
                    <p
                      className={`font-semibold text-sm ${
                        dm ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-xs ${
                        dm ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      ₱{parseFloat(item.price).toLocaleString()} each
                    </p>
                    {item.kind === "promo-bouquet" && (
                      <>
                        <p
                          className={`mt-1 text-[11px] ${
                            dm ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {item.isBuilding
                            ? item.selections?.main?.name
                              ? `${item.selections.main.name} x1`
                              : "Please select your flower"
                            : `${item.selections.main?.name || "Flower"} x1`}
                        </p>
                        {(item.selections?.fillers?.length > 0 || item.selections?.main?.name) && (
                          <p
                            className={`text-[11px] ${
                              dm ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {item.selections?.fillers?.length
                              ? formatPromoFillers(item.selections.fillers)
                              : "Please select 2 fillers"}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        dm
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      x{item.qty}
                    </div>

                    <div
                      className={`w-16 text-right font-bold text-sm ${
                        dm ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      ₱{(item.price * item.qty).toLocaleString()}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.cartId);
                      }}
                      className={`ml-1 px-2 py-1 rounded-md text-sm font-medium transition-all duration-150 ${
                        dm
                          ? "bg-gray-700 text-gray-300 hover:bg-red-900/60 hover:text-red-300 active:bg-red-900/80 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                          : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 active:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Fixed Bottom Layout */}
      <div
        className={`p-4 border-t flex-shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.03)] focus-within:relative z-20 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        style={{ paddingBottom: `calc(16px + env(safe-area-inset-bottom))` }}
      >
        <div className="flex justify-between items-end mb-4">
          <p className={`text-sm font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>Total</p>
          <p className={`font-bold text-2xl tracking-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>₱{total.toLocaleString()}</p>
        </div>

        <button
          onClick={() => { if (cart.length > 0) setMethodModal(true); }}
          disabled={cart.length === 0 || hasIncompleteBuilder}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xl shadow-sm transition-all mx-auto max-w-[500px] ${
            cart.length > 0 && !hasIncompleteBuilder
              ? "bg-[#3ddc84] hover:bg-green-500 text-white active:scale-[0.98]"
              : dm
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Receive Pay
        </button>
        {hasIncompleteBuilder && (
          <p className={`mt-2 text-center text-xs ${dm ? "text-amber-300" : "text-amber-600"}`}>
            Finish the promo bouquet before receiving payment.
          </p>
        )}
      </div>
    </div>
  );
}

export default CartSection;
