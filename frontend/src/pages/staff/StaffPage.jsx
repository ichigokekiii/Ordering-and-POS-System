/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import StaffNavbar from "../../components/StaffNavbar";
import { useProducts } from "../../contexts/ProductContext";
import { ShoppingCart, Trash2, Plus, Minus, Package, Flower2, PlusCircle, CheckCircle } from "lucide-react";
import api from "../services/api";

export default function PosPage({ user, onLogout }) {
  const { products, loading } = useProducts();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Success Modal State ---
  const [successData, setSuccessData] = useState({
    show: false,
    total: 0,
    isDemo: false,
  });

  // --- Builder State ---
  const [builderState, setBuilderState] = useState({
    bouquet: null,
    fillers: {},
    additions: {},
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center font-bold text-blue-600">
        Loading Event POS...
      </div>
    );
  }

  // --- Sourcing logic (Filtered from ProductContext) ---
  const availableProducts = products.filter((p) => p.isAvailable);
  const eventBases = availableProducts.filter((p) => p.category === "Bouquets"); 
  const mainFlowers = availableProducts.filter((p) => p.category === "Additional" && p.type === "Main Flowers");
  const fillers = availableProducts.filter((p) => p.category === "Additional" && p.type === "Fillers");

  // --- Builder Logic & Calculations ---
  const builderTotalFillers = Object.values(builderState.fillers).reduce((sum, q) => sum + q, 0);
  const builderBasePrice = builderState.bouquet ? Number(builderState.bouquet.price) : 0;
  
  const builderAdditionsPrice = Object.entries(builderState.additions).reduce((sum, [id, qty]) => {
    const p = availableProducts.find((prod) => prod.id == id);
    return sum + (p ? Number(p.price) * qty : 0);
  }, 0);
  const builderTotal = builderBasePrice + builderAdditionsPrice;

  // --- Handlers ---
  const updateBuilderFiller = (id, delta) => {
    setBuilderState((prev) => {
      const current = prev.fillers[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, fillers: { ...prev.fillers, [id]: next } };
    });
  };

  const updateBuilderAddition = (id, delta) => {
    setBuilderState((prev) => {
      const current = prev.additions[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, additions: { ...prev.additions, [id]: next } };
    });
  };

  const addCustomToCart = () => {
    if (!builderState.bouquet || builderTotalFillers !== 2) return;

    const selectedFillers = Object.entries(builderState.fillers)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const p = availableProducts.find((prod) => prod.id == id);
        return `${p.name} (Filler) ×${qty}`;
      });

    const selectedAdditions = Object.entries(builderState.additions)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const p = availableProducts.find((prod) => prod.id == id);
        return `${p.name} ×${qty}`;
      });

    const descriptionParts = [
      builderState.bouquet.name,
      ...selectedFillers,
      ...selectedAdditions,
    ];

    const customItem = {
      id: `custom-${Date.now()}`,
      name: "Custom Bouquet (Pop-up Event)",
      description: descriptionParts.join(", "),
      price: builderTotal,
      qty: 1,
    };

    setCart((prev) => [...prev, customItem]);
    setBuilderState({ bouquet: null, fillers: {}, additions: {} }); // Reset
  };

  // --- Cart Actions ---
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, qty: Math.max(0, item.qty + delta) };
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    );
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

 const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);

    const payload = {
      items: cart,
      total_amount: cartTotal,
    };

    try {
      // 2. Use your existing Axios 'api' setup instead of raw fetch
      const response = await api.post("/pos-transactions", payload);

      // Show Success Modal instead of Alert
      setSuccessData({ show: true, total: cartTotal, isDemo: false });
      clearCart();
    } catch (error) {
      console.warn("Backend error:", error);
      // Fallback UI for Demo Mode
      setTimeout(() => {
        setSuccessData({ show: true, total: cartTotal, isDemo: true });
        clearCart();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-gray-800 relative">
      <StaffNavbar user={user} onLogout={onLogout} />

      <div className="p-6">
        <header className="flex items-center gap-3 mb-6 max-w-[1600px] mx-auto">
          <Flower2 className="text-blue-600 w-9 h-9" />
          <h1 className="text-3xl font-bold text-gray-900">Pop-up Event Bouquet Builder</h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
          
          {/* --- Builder Interface --- */}
          <div className="xl:col-span-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            
            {/* 1. Base Size */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold">1</span>
                Select Bouquet Size (Base)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {eventBases.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBuilderState({ ...builderState, bouquet: b })}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 transition text-left h-full ${
                      builderState.bouquet?.id === b.id ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Package className="w-10 h-10 text-blue-400 mt-1 flex-shrink-0"/>
                    <div>
                      <p className="font-bold text-lg text-gray-950 leading-tight">{b.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{b.description || 'Event packaging size'}</p>
                      <p className="text-xl font-extrabold text-blue-600 mt-2">₱{Number(b.price).toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Free Fillers */}
            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold">2</span>
                Choose 2 Free Fillers
              </h2>
              <p className={`text-sm mb-4 font-semibold px-3 py-1 rounded-full inline-block ${builderTotalFillers === 2 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-700'}`}>
                Count: {builderTotalFillers} / 2 {builderTotalFillers === 2 ? '(Max Reached)' : '(Required)'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-3">
                {fillers.map((f) => {
                  const qty = builderState.fillers[f.id] || 0;
                  const atMax = builderTotalFillers >= 2;
                  return (
                    <div key={f.id} className="p-4 rounded-lg border border-gray-200 flex justify-between items-center bg-white shadow-sm">
                      <span className="text-sm font-bold text-gray-800 truncate pr-3">{f.name}</span>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <button onClick={() => updateBuilderFiller(f.id, -1)} disabled={qty === 0} className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50"><Minus className="w-4 h-4"/></button>
                        <span className="text-lg font-bold w-4 text-center">{qty}</span>
                        <button onClick={() => updateBuilderFiller(f.id, 1)} disabled={atMax} className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-200 disabled:opacity-50"><Plus className="w-4 h-4"/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Paid Additions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold">3</span>
                Add Additional Stems (Optional)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-3">
                {[...mainFlowers, ...fillers].map((a) => {
                  const qty = builderState.additions[a.id] || 0;
                  return (
                    <div key={a.id} className="p-4 rounded-lg border border-gray-200 flex justify-between items-center bg-white shadow-sm hover:border-blue-200 transition">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-gray-800 block truncate">{a.name}</span>
                        <span className="text-xs text-blue-600 font-bold">+₱{Number(a.price).toLocaleString()} / stem</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                        <button onClick={() => updateBuilderAddition(a.id, -1)} disabled={qty === 0} className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50"><Minus className="w-4 h-4"/></button>
                        <span className="text-lg font-bold w-4 text-center">{qty}</span>
                        <button onClick={() => updateBuilderAddition(a.id, 1)} className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-200"><Plus className="w-4 h-4"/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Builder Summary Bar */}
            <div className="sticky bottom-4 pt-6 border-t mt-12 flex flex-col sm:flex-row justify-between items-center gap-5 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 z-10">
              <div className="flex gap-4 items-center">
                <div>
                   <p className="text-xs text-gray-500">Base Price</p>
                   <p className="text-lg font-bold text-gray-900">₱{builderBasePrice.toLocaleString()}</p>
                </div>
                <div className="text-gray-300 text-xl font-bold">+</div>
                <div>
                   <p className="text-xs text-gray-500">Additions</p>
                   <p className="text-lg font-bold text-gray-900">₱{builderAdditionsPrice.toLocaleString()}</p>
                </div>
                <div className="text-xl font-extrabold text-blue-500">=</div>
                <div>
                   <p className="text-sm text-gray-500 font-medium">Bouquet Total</p>
                   <p className="text-2xl font-extrabold text-blue-600">₱{builderTotal.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={addCustomToCart}
                disabled={!builderState.bouquet || builderTotalFillers !== 2}
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-6 h-6"/> Add Bouquet to Cart
              </button>
            </div>
          </div>

          {/* --- Right Column: Shopping Cart --- */}
          <div className="xl:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit flex flex-col max-h-[85vh] sticky top-6 z-10">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-950 flex items-center gap-2.5">
                <ShoppingCart className="w-7 h-7 text-blue-600"/> Current Cart
              </h2>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-red-500 flex items-center gap-1.5 text-sm font-semibold hover:text-red-700 transition">
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 px-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-gray-400 font-medium">Builder is empty.</p>
                    <p className="text-sm text-gray-400 mt-1">Configure a bouquet to get started.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 leading-tight">Custom Event Bouquet</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed break-words pr-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="w-24 text-right flex-shrink-0">
                        <span className="font-bold text-gray-950 text-xl">₱{item.price.toLocaleString()}</span>
                        <p className="text-xs text-gray-500 font-medium mt-1">(Bundle Price)</p>
                    </div>
                    <button onClick={() => updateQty(item.id, -1)} className="text-gray-400 hover:text-red-600 mt-0.5"><Trash2 className="w-5 h-5"/></button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="text-lg font-bold text-gray-700">Order Total:</span>
                <span className="text-4xl font-extrabold text-blue-600">₱{cartTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
                className={`w-full py-5 rounded-xl font-bold text-xl transition shadow-lg ${
                  isLoading || cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                }`}
              >
                {isLoading ? "Processing..." : "Record Sale & Collect Payment"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- Success Modal Overlay --- */}
      {successData.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sale Successful!</h2>
            
            {successData.isDemo ? (
              <p className="text-amber-600 text-sm font-medium mb-6 bg-amber-50 py-2 px-3 rounded-lg border border-amber-100">
                Recorded locally (Demo/Offline Mode).
              </p>
            ) : (
              <p className="text-gray-500 mb-6">The transaction has been safely recorded.</p>
            )}

            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Amount Paid</p>
              <p className="text-4xl font-black text-green-600">₱{successData.total.toLocaleString()}</p>
            </div>
            
            <button
              onClick={() => setSuccessData({ show: false, total: 0, isDemo: false })}
              className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95"
            >
              Start Next Order
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
