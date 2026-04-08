import React, { useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";

function ProductGrid({
  categories,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  filteredProducts,
  addToCartWithId,
  bgColors,
  bgColorsDark,
  dm,
  setIsDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const tabs = Object.keys(categories || {});
  const safeActiveTab = tabs.includes(activeTab) ? activeTab : tabs[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* TABS + SEARCH */}
      <div
        className={`flex items-center h-16 border-b flex-shrink-0 px-2 shadow-sm relative z-10 w-full ${
          dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Search Toggle */}
        <div className="flex items-center px-3 pr-3 gap-2 h-full">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded transition ${
              dm
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
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
            className={`p-2 rounded transition ${
              dm
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Search"
            onClick={() => {
              setIsSearchOpen((prev) => {
                const next = !prev;
                if (!next) setSearchQuery("");
                return next;
              });
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 items-center h-full px-2 gap-1">
          {/* Search Input */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isSearchOpen ? "w-48" : "w-0"
            }`}
          >
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

          {/* Tabs */}
          <div
            className={`flex flex-1 overflow-x-auto h-full transition-all duration-300 ${
              isSearchOpen ? "ml-3" : ""
            }`}
          >
            {Object.keys(categories).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 h-full font-bold text-sm tracking-wide whitespace-nowrap transition-colors border-b-4 flex items-center ${
                  safeActiveTab === tab
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
          {(searchQuery
            ? filteredProducts
            : categories[safeActiveTab]
          )?.map((p, index) => {
            const colorClass = dm
              ? bgColorsDark[index % bgColorsDark.length]
              : bgColors[index % bgColors.length];

            return (
              <button
                key={p.id}
                onClick={() => addToCartWithId(p)}
                className={`aspect-square rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md active:scale-95 transition-all outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-none ${colorClass} ${
                  dm ? "hover:outline-gray-600" : ""
                }`}
              >
                <p className="font-bold text-sm md:text-base leading-tight drop-shadow-sm">
                  {p.name}
                </p>
                <p className="text-sm md:text-sm font-medium mt-2 opacity-80">
                  {p.priceLabel || `₱${parseFloat(p.price).toLocaleString()}`}
                </p>
              </button>
            );
          })}
          {(!searchQuery && (!categories[safeActiveTab] || categories[safeActiveTab].length === 0)) && (
            <div className="col-span-full flex items-center justify-center h-40 text-gray-400 text-sm">
              No items available
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={`absolute bottom-6 left-6 p-3 rounded-full shadow-lg border transition-all z-30 ${
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
  );
}

export default ProductGrid;
