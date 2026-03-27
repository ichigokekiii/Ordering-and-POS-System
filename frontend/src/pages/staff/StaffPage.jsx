/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useProducts } from "../../contexts/ProductContext";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Moon, Sun } from "lucide-react";

function StaffPage() {
  const { products, loading } = useProducts();

  // UI STATE
  const [activeTab, setActiveTab] = useState("Bouquets");
  const [cart, setCart] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // PAYMENT FLOW
  const [methodModal, setMethodModal] = useState(false);
  const [cashModal, setCashModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [cashReceived, setCashReceived] = useState(0);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-xl font-semibold ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-700"}`}>
        Loading POS...
      </div>
    );
  }

  const available = products.filter((p) => p.isAvailable);

  const categories = {
    Bouquets: available.filter((p) => p.category === "Bouquets"),
    Fillers: available.filter((p) => p.type === "Fillers"),
    Addons: available.filter((p) => p.category === "Additional"),
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const removeFromCart = (uniqueCartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== uniqueCartId));
  };

  const addToCartWithId = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, cartId: Date.now() + Math.random() }];
    });
  };

  const clearCart = () => setCart([]);

  const finalizeTransaction = async (paymentMethod) => {
    try {
      await api.post("/pos-transactions", {
        items: cart,
        total_amount: total,
        payment_method: paymentMethod,
        cash_received: paymentMethod === 'CASH' ? cashReceived : total
      });
    } catch (err) {
      console.error("Failed to save transaction", err);
    }
    setCart([]);
    setMethodModal(false);
    setCashModal(false);
    setQrModal(false);
    setCashReceived(0);
  };

  const bgColors = [
    "bg-pink-100 text-pink-900 border-pink-200",
    "bg-purple-100 text-purple-900 border-purple-200",
    "bg-blue-100 text-blue-900 border-blue-200",
    "bg-emerald-100 text-emerald-900 border-emerald-200",
    "bg-orange-100 text-orange-900 border-orange-200",
    "bg-red-100 text-red-900 border-red-200",
    "bg-teal-100 text-teal-900 border-teal-200",
    "bg-indigo-100 text-indigo-900 border-indigo-200"
  ];

  const bgColorsDark = [
    "bg-pink-900/40 text-pink-200 border-pink-800",
    "bg-purple-900/40 text-purple-200 border-purple-800",
    "bg-blue-900/40 text-blue-200 border-blue-800",
    "bg-emerald-900/40 text-emerald-200 border-emerald-800",
    "bg-orange-900/40 text-orange-200 border-orange-800",
    "bg-red-900/40 text-red-200 border-red-800",
    "bg-teal-900/40 text-teal-200 border-teal-800",
    "bg-indigo-900/40 text-indigo-200 border-indigo-800"
  ];

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const dm = isDarkMode;

  // --- SEARCH STATE ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  // All available products for search
  const filteredProducts = searchQuery
    ? available.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <div className={`flex overflow-hidden relative h-[100dvh] w-screen ${dm ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* Sliding Sidebar */}
      {isSidebarOpen && (
        <div className={`w-64 flex flex-col z-20 absolute h-full transition-transform transform translate-x-0 border-r shadow-md ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className={`p-4 border-b flex justify-between items-center h-16 ${dm ? "border-gray-700" : ""}`}>
            <h2 className={`font-bold text-lg ${dm ? "text-blue-400" : "text-blue-600"}`}>Petal Express</h2>
          </div>
          <div className="p-4 flex flex-col gap-2 flex-1">
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>Order Types</p>
            <Link to="/staff/orderpremade" className={`p-3 rounded-lg font-semibold transition shadow-sm border border-transparent ${dm ? "bg-gray-700 text-gray-200 hover:bg-green-900/40 hover:text-green-300 hover:border-green-700" : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200"}`}>Premade Orders</Link>
            <Link to="/staff/ordercustom" className={`p-3 rounded-lg font-semibold transition shadow-sm border border-transparent ${dm ? "bg-gray-700 text-gray-200 hover:bg-blue-900/40 hover:text-blue-300 hover:border-blue-700" : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"}`}>Custom Orders</Link>
            <div className="mt-auto pt-4">
              <Link
                to="/admin"
                className={`w-full p-3 rounded-lg font-semibold transition shadow-sm border border-transparent text-center block ${
                  dm
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDE (BUILDER) */}
      <div className={`flex-1 flex flex-col transition-all overflow-hidden min-h-0 ${isSidebarOpen ? 'ml-64' : ''}`}>

        {/* TABS Navigation */}
        <div className={`flex items-center h-16 border-b flex-shrink-0 px-2 shadow-sm relative z-10 w-full ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          {/* Sidebar Toggle & Search */}
          <div className={`flex items-center px-3 pr-3 gap-2 h-full`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded transition ${dm ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <button
              className={`p-2 rounded transition ${dm ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
              title="Search"
              onClick={() => {
                setIsSearchOpen((prev) => {
                  const next = !prev;
                  if (!next) setSearchQuery("");
                  return next;
                });
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          <div className="flex flex-1 items-center h-full px-2 gap-1">

            {/* Search Input (inline, animated width) */}
            <div className={`transition-all duration-300 overflow-hidden ${isSearchOpen ? "w-48" : "w-0"}`}>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search..."
                className={`w-full px-3 py-1.5 rounded-md border text-sm outline-none ${
                  dm
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    : "bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Tabs (shift slightly when search is open) */}
            <div className={`flex flex-1 overflow-x-auto h-full transition-all duration-300 ${isSearchOpen ? "ml-3" : ""}`}>
              {Object.keys(categories).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 h-full font-bold text-sm tracking-wide whitespace-nowrap transition-colors border-b-4 flex items-center ${
                    activeTab === tab
                      ? dm
                        ? "border-blue-500 text-blue-400 bg-blue-900/20"
                        : "border-blue-600 text-blue-700 bg-blue-50/50"
                      : dm
                        ? "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative min-h-0"
          onClick={() => {
            if (isSearchOpen) {
              setIsSearchOpen(false);
              setSearchQuery("");
            }
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {(searchQuery ? filteredProducts : categories[activeTab])?.map((p, index) => {
              const colorClass = dm
                ? bgColorsDark[index % bgColorsDark.length]
                : bgColors[index % bgColors.length];
              return (
                <button
                  key={p.id}
                  onClick={() => addToCartWithId(p)}
                  className={`aspect-square rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-none ${colorClass} ${dm ? "hover:outline-gray-600" : ""}`}
                >
                  <p className="font-bold text-sm md:text-base leading-tight drop-shadow-sm">{p.name}</p>
                  <p className="text-sm md:text-sm font-medium mt-2 opacity-80">₱{parseFloat(p.price).toLocaleString()}</p>
                </button>
              );
            })}
          </div>

          {/* Dark Mode Toggle (Bottom Left) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute bottom-6 left-6 p-3 rounded-full shadow-lg border transition-all z-10 ${
              dm
                ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:shadow-xl"
                : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-xl"
            }`}
            title="Toggle Dark Mode"
          >
            {dm ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE (CART) */}
      <div className={`w-[380px] flex flex-col z-10 border-l h-[100dvh] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>

        {/* Cart Header */}
        <div className={`h-16 px-4 border-b flex justify-between items-center flex-shrink-0 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <h2 className={`font-bold text-lg ${dm ? "text-gray-100" : "text-gray-800"}`}>Cart</h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          </div>

          <button onClick={clearCart} className={`transition p-2 rounded-md ${dm ? "text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50" : "text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100"}`} title="Clear Cart">
            <Trash size={18} />
          </button>
        </div>

        {/* Cart Items */}
        <div className={`flex-1 overflow-x-hidden overflow-y-auto p-3 space-y-2 min-h-0 ${dm ? "bg-gray-900/30" : "bg-gray-50/50"}`}>
          {cart.length === 0 ? (
            <div className={`h-full flex flex-col items-center justify-center p-6 text-center ${dm ? "text-gray-500" : "text-gray-400"}`}>
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p>Tap an item to add to the transaction. Swipe left or right to delete an item.</p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.cartId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className={`relative mb-2 rounded border shadow-sm overflow-hidden group ${dm ? "border-gray-700 bg-red-900/20" : "border-gray-100 bg-red-50"}`}
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
                    whileDrag={{ scale: 0.98, opacity: 0.9 }}
                    className={`relative p-3 flex items-center justify-between z-10 w-full cursor-grab active:cursor-grabbing ${dm ? "bg-gray-800" : "bg-white"}`}
                  >
                    <div className="flex-1 pr-2 pointer-events-none select-none">
                      <p className={`font-semibold leading-tight text-sm ${dm ? "text-gray-100" : "text-gray-800"}`}>{item.name}</p>
                      <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>₱{parseFloat(item.price).toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-none select-none">
                      <div className={`rounded text-center px-2 py-1 text-xs font-bold ${dm ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"}`}>x{item.qty}</div>
                      <div className={`w-16 text-right font-bold text-sm ${dm ? "text-gray-100" : "text-gray-800"}`}>₱{(item.price * item.qty).toLocaleString()}</div>
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
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xl shadow-sm transition-all mx-auto max-w-[500px] ${
              cart.length > 0
                ? "bg-[#3ddc84] hover:bg-green-500 text-white active:scale-[0.98]"
                : dm
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Receive Pay
          </button>
        </div>
      </div>

      {/* --- PAYMENT MODALS --- */}
      {/* 1. METHOD MODAL */}
      {methodModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className={`p-8 rounded-2xl w-[90%] max-w-[480px] shadow-2xl relative ${dm ? "bg-gray-800" : "bg-white"}`}>
            <button
              onClick={() => setMethodModal(false)}
              className={`absolute top-4 right-4 rounded-full p-2 transition-colors ${dm ? "text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600" : "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100"}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className={`text-2xl font-bold mb-8 text-center ${dm ? "text-gray-100" : "text-gray-800"}`}>Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => { setMethodModal(false); setCashModal(true); setCashReceived(0); }}
                className={`aspect-square border-2 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${dm ? "bg-blue-900/30 hover:bg-blue-900/50 border-blue-700 text-blue-300" : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"}`}
              >
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span className="text-2xl font-bold">CASH</span>
              </button>
              <button
                onClick={() => { setMethodModal(false); setQrModal(true); setCashReceived(total); }}
                className={`aspect-square border-2 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${dm ? "bg-purple-900/30 hover:bg-purple-900/50 border-purple-700 text-purple-300" : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"}`}
              >
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                <span className="text-2xl font-bold">QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CASH MODAL */}
      {cashModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className={`rounded-2xl w-[90%] max-w-[600px] shadow-2xl flex flex-col overflow-hidden ${dm ? "bg-gray-800" : "bg-white"}`}>
            <div className={`border-b p-4 flex items-center gap-4 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button onClick={() => { setCashModal(false); setMethodModal(true); }} className={`p-2 rounded-full transition ${dm ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>Cash Payment</h3>
            </div>

            <div className={`p-6 md:p-8 flex flex-col gap-8 ${dm ? "bg-gray-900/40" : "bg-gray-50"}`}>
              <div className={`p-6 rounded-xl shadow-sm border space-y-3 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="flex justify-between text-lg">
                  <span className={`font-medium ${dm ? "text-gray-400" : "text-gray-500"}`}>Total</span>
                  <span className={`font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>₱{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className={`font-medium ${dm ? "text-gray-400" : "text-gray-500"}`}>Cash Received</span>
                  <span className="font-bold text-blue-500">₱{cashReceived.toLocaleString()}</span>
                </div>
                <div className={`h-px my-2 ${dm ? "bg-gray-700" : "bg-gray-100"}`}></div>
                <div className="flex justify-between text-2xl">
                  <span className={`font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>Change</span>
                  <span className={`font-bold ${cashReceived >= total ? 'text-green-500' : 'text-red-500'}`}>
                    ₱{Math.max(0, cashReceived - total).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCashReceived(prev => prev + amt)}
                    className={`border py-3 rounded-xl font-bold text-lg shadow-sm transition active:scale-95 ${dm ? "bg-gray-700 border-gray-600 text-gray-200 hover:text-blue-300 hover:border-blue-600" : "bg-white border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-300"}`}
                  >
                    +₱{amt}
                  </button>
                ))}
                <button
                  onClick={() => setCashReceived(0)}
                  className={`border py-3 rounded-xl font-bold text-lg shadow-sm transition active:scale-95 col-span-1 text-red-500 ${dm ? "bg-gray-700 border-gray-600 hover:bg-red-900/30" : "bg-white border-gray-200 hover:bg-red-50"}`}
                >
                  Clear
                </button>
                <button
                  onClick={() => setCashReceived(total)}
                  className="bg-blue-600 border border-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-lg text-white shadow-sm transition active:scale-95 col-span-2"
                >
                  Exact Amount (₱{total})
                </button>
              </div>
            </div>

            <div className={`p-4 border-t ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button
                onClick={() => finalizeTransaction('CASH')}
                disabled={cashReceived < total}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-sm ${
                  cashReceived >= total
                    ? "bg-[#3ddc84] hover:bg-green-500 text-white active:scale-[0.98]"
                    : dm ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Finish Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. QR MODAL */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className={`rounded-2xl w-[90%] max-w-[400px] shadow-2xl flex flex-col overflow-hidden ${dm ? "bg-gray-800" : "bg-white"}`}>
            <div className={`border-b p-4 flex items-center gap-4 ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button onClick={() => { setQrModal(false); setMethodModal(true); }} className={`p-2 rounded-full transition ${dm ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>QR Payment</h3>
            </div>

            <div className={`p-8 flex flex-col items-center justify-center gap-6 ${dm ? "bg-gray-900/40" : "bg-gray-50"}`}>
              <div className={`p-4 rounded-2xl shadow-sm border ${dm ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                <svg className={`w-48 h-48 ${dm ? "text-gray-100" : "text-gray-800"}`} viewBox="0 0 100 100">
                  <rect width="100" height="100" fill={dm ? "#1f2937" : "#fff"} />
                  <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill={dm ? "#e5e7eb" : "#000"} />
                  <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill={dm ? "#e5e7eb" : "#000"} />
                  <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="40" y="10" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="55" y="15" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="10" y="40" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="25" y="55" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="40" y="40" width="20" height="20" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="70" y="40" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="85" y="55" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="40" y="70" width="10" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="55" y="80" width="20" height="10" fill={dm ? "#e5e7eb" : "#000"} />
                  <rect x="80" y="70" width="10" height="20" fill={dm ? "#e5e7eb" : "#000"} />
                </svg>
              </div>
              <div className="text-center">
                <p className={`font-medium mb-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>Total Amount to Pay</p>
                <p className={`text-4xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>₱{total.toLocaleString()}</p>
              </div>
              <p className={`text-sm text-center ${dm ? "text-gray-500" : "text-gray-400"}`}>Ask the customer to scan the QR code to complete the payment.</p>
            </div>

            <div className={`p-4 border-t ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <button
                onClick={() => finalizeTransaction('QR')}
                className="w-full bg-[#3ddc84] hover:bg-green-500 text-white active:scale-[0.98] py-4 rounded-xl font-bold text-xl transition-all shadow-sm"
              >
                Finish Transaction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default StaffPage;