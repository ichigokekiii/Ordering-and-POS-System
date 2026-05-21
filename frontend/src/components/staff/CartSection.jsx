/* eslint-disable no-unused-vars */


import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, X } from "lucide-react";

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

const formatPromoMains = (mains = []) =>
  Object.values(
    mains.reduce((summary, main) => {
      const key = main.name;
      if (!summary[key]) {
        summary[key] = { name: main.name, qty: 0 };
      }
      summary[key].qty += 1;
      return summary;
    }, {})
  )
    .map((main) => `${main.name} x${main.qty}`)
    .join(", ");

function CartSection({
  cart,
  total,
  removeFromCart,
  clearCart,
  setMethodModal,
  dm,
  hasIncompleteBuilder,
  isOpen = true,
  onClose,
}) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 flex h-[100dvh] w-full max-w-sm flex-col border-l shadow-[-4px_0_15px_rgba(0,0,0,0.05)] transition-transform duration-300 md:max-w-[320px] lg:relative lg:z-10 lg:w-[380px] lg:max-w-none lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${dm ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
    >
      {/* Header */}
      <div
        className={`flex h-16 flex-shrink-0 items-center justify-between border-b px-4 ${
          dm
            ? "border-gray-700 bg-gray-800"
            : "border-gray-100 bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <h2
            className={`text-lg font-bold ${
              dm ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Cart
          </h2>
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {cart.reduce((s, i) => s + i.qty, 0)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearCart}
            className={`rounded-md p-2 transition ${
              dm
                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                : "bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600"
            }`}
            title="Clear Cart"
          >
            <Trash size={18} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-md transition lg:hidden ${
                dm
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div
        className={`min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto p-3 ${
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
            className={`flex h-full flex-col items-center justify-center p-6 text-center ${dm ? "text-gray-500" : "text-gray-400"}`}
          >
            <svg className="mb-4 h-16 w-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`group relative mb-2 overflow-hidden rounded border shadow-sm ${
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
                  className={`relative z-10 flex w-full cursor-grab items-center justify-between p-3 active:cursor-grabbing ${
                    dm ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="pointer-events-none flex-1 select-none pr-2">
                    <p
                      className={`text-sm font-semibold ${
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
                          {(item.required_main_count ?? 1) === 0
                            ? "No main flowers required"
                            : item.selections?.mains?.length
                            ? formatPromoMains(item.selections.mains)
                            : `Please select ${item.required_main_count ?? 1} main flower${(item.required_main_count ?? 1) !== 1 ? "s" : ""}`}
                        </p>
                        <p
                          className={`text-[11px] ${
                            dm ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {(item.required_filler_count ?? 2) === 0
                            ? "No fillers required"
                            : item.selections?.fillers?.length
                            ? formatPromoFillers(item.selections.fillers)
                            : `Please select ${item.required_filler_count ?? 2} filler${(item.required_filler_count ?? 2) !== 1 ? "s" : ""}`}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        dm
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      x{item.qty}
                    </div>

                    <div
                      className={`w-16 text-right text-sm font-bold ${
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
                      className={`ml-1 rounded-md px-2 py-1 text-sm font-medium transition-all duration-150 ${
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
        className={`z-20 flex-shrink-0 border-t p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.03)] focus-within:relative ${dm ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
        style={{ paddingBottom: `calc(16px + env(safe-area-inset-bottom))` }}
      >
        <div className="mb-4 flex items-end justify-between">
          <p className={`text-sm font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>Total</p>
          <p className={`text-2xl font-bold tracking-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>₱{total.toLocaleString()}</p>
        </div>

        <button
          onClick={() => { if (cart.length > 0) setMethodModal(true); }}
          disabled={cart.length === 0 || hasIncompleteBuilder}
          className={`mx-auto flex w-full max-w-[500px] items-center justify-center gap-2 rounded-xl py-4 text-xl font-bold shadow-sm transition-all ${
            cart.length > 0 && !hasIncompleteBuilder
              ? "bg-[#3ddc84] text-white hover:bg-green-500 active:scale-[0.98]"
              : dm
                ? "cursor-not-allowed bg-gray-700 text-gray-500"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
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
