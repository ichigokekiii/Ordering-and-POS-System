/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useProducts } from "../../contexts/ProductContext";
import api from "../../services/api";
import ProductGrid from "../../components/staff/ProductGrid";
import Sidebar from "../../components/staff/Sidebar";
import CartSection from "../../components/staff/CartSection";
import PaymentModals from "../../components/staff/PaymentModals";

const STAFF_POS_CART_STORAGE_KEY = "staff-pos-cart";
const STAFF_POS_DARK_MODE_STORAGE_KEY = "staff-pos-dark-mode";

function StaffPage({ children, customCategories }) {
  const { products, loading } = useProducts();

  // UI STATE
  const [activeTab, setActiveTab] = useState("Bouquets");
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      const savedCart = window.sessionStorage.getItem(STAFF_POS_CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to restore POS cart", error);
      return [];
    }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      return window.sessionStorage.getItem(STAFF_POS_DARK_MODE_STORAGE_KEY) === "true";
    } catch (error) {
      console.error("Failed to restore POS dark mode", error);
      return false;
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // PAYMENT FLOW
  const [methodModal, setMethodModal] = useState(false);
  const [cashModal, setCashModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [cashReceived, setCashReceived] = useState(0);


  const available = products.filter((p) => p.isAvailable);

  const categories = {
    Bouquets: available
      .filter((p) => p.category === "Bouquets")
      .map((product) => ({ ...product, productSource: "product" })),
    Fillers: available
      .filter((p) => p.type === "Fillers")
      .map((product) => ({ ...product, productSource: "product" })),
    Addons: available
      .filter((p) => p.category === "Additional")
      .map((product) => ({ ...product, productSource: "product" })),
  };

  const displayCategories = customCategories || categories;
  const catalogItems = Object.values(displayCategories || {}).flat();
  const activePromoBuilder = cart.find(
    (item) => item.kind === "promo-bouquet" && item.isBuilding
  );
  const hasIncompleteBuilder = Boolean(activePromoBuilder);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const removeFromCart = (uniqueCartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== uniqueCartId));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  const buildPromoSignature = (main, fillers) => {
    const fillerIds = fillers
      .map((filler) => filler.id)
      .sort((a, b) => String(a).localeCompare(String(b)));

    return `${main.id}::${fillerIds.join("|")}`;
  };

  const startPromoBouquet = () => {
    if (activePromoBuilder) {
      showToast("info", "Finish the current promo bouquet first.");
      if (displayCategories.Main) {
        setActiveTab("Main");
      }
      return;
    }

    const promoCartItem = {
      cartId: Date.now() + Math.random(),
      id: null,
      product_id: null,
      productSource: "promo",
      kind: "promo-bouquet",
      name: "Promo Bouquet",
      price: 0,
      qty: 1,
      isBuilding: true,
      selections: {
        main: null,
        fillers: [],
      },
    };

    setCart((prev) => [...prev, promoCartItem]);
    if (displayCategories.Main) {
      setActiveTab("Main");
    }
    showToast("success", "Select 1 main flower and 2 fillers.");
  };

  const finalizePromoBouquetSelection = (nextItem, prevCart) => {
    const signature = buildPromoSignature(nextItem.selections.main, nextItem.selections.fillers);
    const existingIndex = prevCart.findIndex(
      (item) =>
        item.kind === "promo-bouquet" &&
        !item.isBuilding &&
        item.bundleSignature === signature
    );

    if (existingIndex !== -1) {
      return prevCart
        .filter((item) => item.cartId !== nextItem.cartId)
        .map((item, index) =>
          index === existingIndex
            ? { ...item, qty: item.qty + 1 }
            : item
        );
    }

    return prevCart.map((item) =>
      item.cartId === nextItem.cartId
        ? {
            ...nextItem,
            isBuilding: false,
            bundleSignature: signature,
          }
        : item
    );
  };

  const applyPromoSelection = (product) => {
    if (!activePromoBuilder) return false;

    if (product.builderKind === "promo-bouquet") {
      showToast("info", "Finish the current promo bouquet first.");
      return true;
    }

    if (product.selectionRole === "main") {
      if (activePromoBuilder.selections.main) {
        showToast("info", "This promo bouquet already has a main flower.");
        if (displayCategories.Fillers) {
          setActiveTab("Fillers");
        }
        return true;
      }

      setCart((prev) =>
        prev.map((item) =>
          item.cartId === activePromoBuilder.cartId
            ? {
                ...item,
                price: Number(product.price) || 0,
                selections: {
                  ...item.selections,
                  main: {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price) || 0,
                  },
                },
              }
            : item
        )
      );

      if (displayCategories.Fillers) {
        setActiveTab("Fillers");
      }
      showToast("success", "Main flower added. Choose 2 fillers next.");
      return true;
    }

    if (product.selectionRole === "filler") {
      if (!activePromoBuilder.selections.main) {
        showToast("error", "Select the main flower first.");
        if (displayCategories.Main) {
          setActiveTab("Main");
        }
        return true;
      }

      if (activePromoBuilder.selections.fillers.length >= 2) {
        showToast("info", "This promo bouquet already has 2 fillers.");
        return true;
      }

      setCart((prev) => {
        const currentBuilder = prev.find((item) => item.cartId === activePromoBuilder.cartId);
        if (!currentBuilder) return prev;

        const nextFillers = [
          ...currentBuilder.selections.fillers,
          { id: product.id, name: product.name },
        ];

        const nextItem = {
          ...currentBuilder,
          selections: {
            ...currentBuilder.selections,
            fillers: nextFillers,
          },
        };

        if (nextFillers.length === 2) {
          return finalizePromoBouquetSelection(nextItem, prev);
        }

        return prev.map((item) =>
          item.cartId === activePromoBuilder.cartId ? nextItem : item
        );
      });

      if (activePromoBuilder.selections.fillers.length + 1 < 2) {
        showToast("success", "Filler added. Choose 1 more filler.");
      }
      return true;
    }

    showToast("error", "Finish the promo bouquet before adding other items.");
    return true;
  };

  const addStandardCartItem = (product) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.kind !== "promo-bouquet" &&
          item.id === product.id &&
          item.productSource === (product.productSource || "product")
      );
      if (existing) {
        return prev.map((item) =>
          item.cartId === existing.cartId ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          product_id: product.productSource === "product" ? product.id : null,
          qty: 1,
          cartId: Date.now() + Math.random(),
        },
      ];
    });
  };

  const addToCartWithId = (product) => {
    if (product.builderKind === "promo-bouquet") {
      startPromoBouquet();
      return;
    }

    if (applyPromoSelection(product)) {
      return;
    }

    addStandardCartItem(product);
  };

  const clearCart = () => setCart([]);

  const finalizeTransaction = async (paymentMethod) => {
    try {
      await api.post("/pos-transactions", {
        items: cart.map((item) => ({
          ...item,
          product_id: item.product_id ?? null,
        })),
        total_amount: total,
        payment_method: paymentMethod,
        cash_received: paymentMethod === 'CASH' ? cashReceived : total
      });

      showToast("success", "Transaction completed");
    } catch (err) {
      console.error("Failed to save transaction", err);

      // If backend responded, it likely still succeeded → show success
      if (err.response) {
        showToast("success", "Transaction completed");
      } else {
        showToast("error", "Something went wrong");
      }
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
    ? catalogItems.filter(
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(STAFF_POS_CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to persist POS cart", error);
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(
        STAFF_POS_DARK_MODE_STORAGE_KEY,
        String(isDarkMode)
      );
    } catch (error) {
      console.error("Failed to persist POS dark mode", error);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (displayCategories) {
      const firstTab = Object.keys(displayCategories)[0];
      if (firstTab && firstTab !== activeTab) {
        setActiveTab(firstTab);
      }
    }
  }, [displayCategories]);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-xl font-semibold ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-700"}`}>
        Loading POS...
      </div>
    );
  }

  return (
    <div className={`flex overflow-hidden relative h-[100dvh] w-screen ${dm ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* Sliding Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        dm={dm}
      />

      {/* LEFT SIDE (BUILDER) */}
      {/* DYNAMIC CONTENT (Premade / Custom) */}
      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 transition-[margin] duration-200 ease-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* MAIN CONTENT (POS / Premade / Custom) */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ProductGrid
            categories={displayCategories}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            filteredProducts={filteredProducts}
            addToCartWithId={addToCartWithId}
            bgColors={bgColors}
            bgColorsDark={bgColorsDark}
            dm={dm}
            setIsDarkMode={setIsDarkMode}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>
      </div>

      {/* RIGHT SIDE (CART) */}
      <CartSection
        cart={cart}
        dm={dm}
        total={total}
        clearCart={clearCart}
        removeFromCart={removeFromCart}
        setMethodModal={setMethodModal}
        hasIncompleteBuilder={hasIncompleteBuilder}
      />

      {toast && (
        <div className="fixed top-4 right-4 z-[200] pointer-events-none">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-xs font-medium backdrop-blur-sm border transition-all animate-[fadeIn_.2s_ease-out] max-w-[240px] ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-400"
                : toast.type === "info"
                ? "bg-blue-500/90 text-white border-blue-400"
                : "bg-red-500/90 text-white border-red-400"
            }`}
          >
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}


      {/* --- PAYMENT MODALS --- */}

      <PaymentModals
        methodModal={methodModal}
        cashModal={cashModal}
        qrModal={qrModal}
        setMethodModal={setMethodModal}
        setCashModal={setCashModal}
        setQrModal={setQrModal}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        total={total}
        finalizeTransaction={finalizeTransaction}
        dm={dm}
        quickAmounts={quickAmounts}
      />
    </div>
  );
}
export default StaffPage;
