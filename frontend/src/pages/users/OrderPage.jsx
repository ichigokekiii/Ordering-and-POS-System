import { useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";
import { useSchedules } from "../../contexts/ScheduleContext";

function OrderPage() {
  const navigate = useNavigate();
  const { premades, products } = useProducts();
  const { selectedScheduleId } = useCart();
  const { schedules } = useSchedules();
  const { searchTerm = "" } = useOutletContext() || {};
  const isVisibleForOrdering = (product) => !product.isArchived && product.isAvailable;
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchProduct = (product) =>
    isVisibleForOrdering(product) &&
    (product.name || "").toLowerCase().includes(normalizedSearch);

  const premadeMatches = useMemo(
    () => (normalizedSearch ? premades.filter(matchProduct) : []),
    [normalizedSearch, premades]
  );

  const customMatches = useMemo(
    () => (
      normalizedSearch
        ? products.filter(
            (product) =>
              matchProduct(product) &&
              (product.category === "Bouquets" || product.category === "Additional")
          )
        : []
    ),
    [normalizedSearch, products]
  );

  const exactPremadeMatch = premadeMatches.some(
    (product) => (product.name || "").toLowerCase() === normalizedSearch
  );
  const exactCustomMatch = customMatches.some(
    (product) => (product.name || "").toLowerCase() === normalizedSearch
  );

  const targetRoute = useMemo(() => {
    if (!normalizedSearch) {
      return null;
    }

    if (exactPremadeMatch && !exactCustomMatch) {
      return "/orderpremade";
    }

    if (exactCustomMatch && !exactPremadeMatch) {
      return "/ordercustom";
    }

    if (premadeMatches.length > 0 && customMatches.length === 0) {
      return "/orderpremade";
    }

    if (customMatches.length > 0 && premadeMatches.length === 0) {
      return "/ordercustom";
    }

    return null;
  }, [
    customMatches.length,
    exactCustomMatch,
    exactPremadeMatch,
    normalizedSearch,
    premadeMatches.length,
  ]);

  useEffect(() => {
    if (targetRoute) {
      navigate(targetRoute);
    }
  }, [navigate, targetRoute]);

  const searchMessage = (() => {
    if (!normalizedSearch) {
      return "Search for a bouquet or flower to jump into the right order flow.";
    }

    if (targetRoute === "/orderpremade") {
      return `Found ${premadeMatches.length} premade match${premadeMatches.length === 1 ? "" : "es"}. Redirecting you to premade.`;
    }

    if (targetRoute === "/ordercustom") {
      return `Found ${customMatches.length} custom match${customMatches.length === 1 ? "" : "es"}. Redirecting you to custom builder.`;
    }

    if (premadeMatches.length === 0 && customMatches.length === 0) {
      return `No results found for "${searchTerm}". Try a broader flower or bouquet name.`;
    }

    return `Your search matches both premade and custom items. Refine it a little more and I’ll route you automatically.`;
  })();

  return (
    <div className="w-full">
      <div className="mx-auto flex min-h-[80vh] max-w-[1200px] flex-col items-center justify-center px-6 py-12">
        <div className="mb-12 text-center">
          {selectedSchedule && (
            <p className="mb-5 text-sm text-gray-500">
              Ordering for <span className="font-semibold text-gray-900">{selectedSchedule.schedule_name}</span>
            </p>
          )}
          <h1 className="text-4xl font-playfair font-bold text-gray-900 md:text-6xl">
            What would you like
            <br />
            <span className="mt-2 block -rotate-1 transform font-dancing text-5xl font-normal text-[#4f6fa5] md:text-7xl">
              to order?
            </span>
          </h1>
        </div>

        <div className="flex w-full max-w-4xl flex-col justify-center gap-6 md:flex-row md:gap-8">
          <button
            type="button"
            onClick={() => navigate("/orderpremade")}
            className="group relative flex h-[400px] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl md:max-w-md"
          >
            <div className="h-2/3 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1490750967868-88aa4486c946"
                alt="Premade Bouquets"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex h-1/3 w-full flex-col items-center justify-center bg-white p-6">
              <h2 className="mb-2 text-2xl font-playfair font-bold text-gray-900">
                Premade Collection
              </h2>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                Curated ready-made blooms
              </p>
              <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="border-b border-[#4f6fa5] pb-0.5 text-xs font-bold text-[#4f6fa5]">
                  Explore →
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/ordercustom")}
            className="group relative flex h-[400px] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl md:max-w-md"
          >
            <div className="h-2/3 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd"
                alt="Custom Creations"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex h-1/3 w-full flex-col items-center justify-center bg-white p-6">
              <h2 className="mb-2 text-2xl font-playfair font-bold text-gray-900">
                Custom Creations
              </h2>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                Design your own arrangement
              </p>
              <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="border-b border-[#4f6fa5] pb-0.5 text-xs font-bold text-[#4f6fa5]">
                  Build Now →
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
