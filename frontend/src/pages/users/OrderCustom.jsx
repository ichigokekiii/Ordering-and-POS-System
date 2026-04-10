import { useRef, useState } from "react";
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";
import { useSchedules } from "../../contexts/ScheduleContext";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import { validateGreetingCardMessage } from "../../utils/authValidation";

const MAX_GREETING_CHARS = 150;
const GREETING_CARD_PRICE = 5;

function SelectionCard({
  product,
  quantity,
  onAdd,
  onRemove,
  subtitle,
  helperText,
  disableAdd = false,
}) {
  const isSelected = quantity > 0;
  const isMuted = disableAdd && !isSelected;

  const handleAdd = () => {
    if (disableAdd) {
      return;
    }

    onAdd(product.id);
  };

  return (
    <div
      role={disableAdd ? undefined : "button"}
      tabIndex={disableAdd ? -1 : 0}
      onClick={handleAdd}
      onKeyDown={(event) => {
        if (disableAdd) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleAdd();
        }
      }}
      className={`group relative overflow-hidden rounded-3xl border bg-white transition-all duration-200 ${
        isSelected
          ? "border-[#4f6fa5] shadow-md ring-2 ring-[#4f6fa5]/10"
          : "border-gray-200"
      } ${
        isMuted
          ? "cursor-not-allowed opacity-45"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
      }`}
    >
      <div className="relative flex h-52 items-center justify-center border-b border-gray-100 bg-gray-50/60 p-6">
        <img
          src={`http://localhost:8000${product.image}`}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {isSelected && (
          <div className="absolute right-4 top-4 rounded-full bg-[#4f6fa5] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
            {quantity} selected
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="space-y-1 text-center">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {product.name}
          </h3>
          {subtitle && (
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#4f6fa5]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {helperText}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {isSelected ? `${quantity} ${product.name} added` : "Tap card to add 1"}
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(product.id);
              }}
              disabled={quantity === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-[#4f6fa5] hover:text-[#4f6fa5] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label={`Remove ${product.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAdd();
              }}
              disabled={disableAdd}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-[#4f6fa5] hover:text-[#4f6fa5] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label={`Add ${product.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BouquetCard({ product, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200 ${
        isSelected
          ? "border-[#4f6fa5] shadow-md ring-2 ring-[#4f6fa5]/10"
          : "border-gray-200 hover:-translate-y-1 hover:shadow-lg"
      }`}
    >
      <div className="relative flex h-56 items-center justify-center border-b border-gray-100 bg-gray-50/40 p-6">
        <img
          src={`http://localhost:8000${product.image}`}
          alt={product.name}
          className="h-full w-full object-contain"
        />
        {isSelected && (
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#4f6fa5] text-white shadow-sm">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="truncate text-lg font-playfair font-bold text-gray-900">
          {product.name}
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Requires {Number(product.required_main_count ?? 1)} main,{" "}
          {Number(product.required_filler_count ?? 2)} filler
        </p>
        <p className="text-lg font-bold text-[#4f6fa5]">
          ₱{Number(product.price).toLocaleString()}
        </p>
      </div>
    </button>
  );
}

function OrderCustom() {
  const navigate = useNavigate();
  const { searchTerm = "" } = useOutletContext() || {};
  const { products, loading } = useProducts();
  const { addToCart, selectedScheduleId } = useCart();
  const { schedules } = useSchedules();
  const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId);

  const bouquetSectionRef = useRef(null);
  const mainSectionRef = useRef(null);
  const fillerSectionRef = useRef(null);
  const addOnSectionRef = useRef(null);
  const personalSectionRef = useRef(null);
  const customItemCounterRef = useRef(0);

  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [mainCounts, setMainCounts] = useState({});
  const [fillerCounts, setFillerCounts] = useState({});
  const [additionalCounts, setAdditionalCounts] = useState({});
  const [greetingCard, setGreetingCard] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");
  const [greetingError, setGreetingError] = useState("");
  const [added, setAdded] = useState(false);

  const availableProducts = products.filter(
    (product) => !product.isArchived && product.isAvailable
  );
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch = (product) =>
    !normalizedSearch ||
    product.name.toLowerCase().includes(normalizedSearch) ||
    (product.category || "").toLowerCase().includes(normalizedSearch) ||
    (product.type || "").toLowerCase().includes(normalizedSearch);

  const bouquets = availableProducts.filter(
    (product) => product.category === "Bouquets" && matchesSearch(product)
  );
  const mainFlowers = availableProducts.filter(
    (product) =>
      product.category === "Additional" &&
      product.type === "Main Flowers" &&
      matchesSearch(product)
  );
  const fillers = availableProducts.filter(
    (product) =>
      product.category === "Additional" &&
      product.type === "Fillers" &&
      matchesSearch(product)
  );
  const addOns = availableProducts.filter(
    (product) =>
      product.category === "Additional" &&
      matchesSearch(product)
  );

  const requiredMainCount = Number(selectedBouquet?.required_main_count ?? 1);
  const requiredFillerCount = Number(selectedBouquet?.required_filler_count ?? 2);
  const totalMains = Object.values(mainCounts).reduce((sum, qty) => sum + qty, 0);
  const totalFillers = Object.values(fillerCounts).reduce((sum, qty) => sum + qty, 0);

  const selectedMains = availableProducts
    .filter((product) => (mainCounts[product.id] || 0) > 0)
    .map((product) => ({ ...product, quantity: mainCounts[product.id] }));
  const selectedFillers = availableProducts
    .filter((product) => (fillerCounts[product.id] || 0) > 0)
    .map((product) => ({ ...product, quantity: fillerCounts[product.id] }));
  const selectedAddOns = availableProducts
    .filter((product) => (additionalCounts[product.id] || 0) > 0)
    .map((product) => ({ ...product, quantity: additionalCounts[product.id] }));

  const basePrice = Number(selectedBouquet?.price || 0);
  const addOnTotal = selectedAddOns.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const greetingTotal = greetingCard ? GREETING_CARD_PRICE : 0;
  const totalPrice = basePrice + addOnTotal + greetingTotal;
  const baseBuildReady =
    selectedBouquet &&
    totalMains === requiredMainCount &&
    totalFillers === requiredFillerCount;

  const canAddToCart =
    baseBuildReady && (!greetingCard || greetingMessage.trim());

  const scrollToSection = (ref) => {
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const stepRefs = {
    bouquet: bouquetSectionRef,
    main: mainSectionRef,
    filler: fillerSectionRef,
    addOns: addOnSectionRef,
    personal: personalSectionRef,
  };

  const currentStepKey = (() => {
    if (!selectedBouquet) {
      return "bouquet";
    }

    if (totalMains < requiredMainCount) {
      return "main";
    }

    if (totalFillers < requiredFillerCount) {
      return "filler";
    }

    return greetingCard ? "personal" : "addOns";
  })();

  const steps = [
    {
      key: "bouquet",
      label: "1. Bouquet",
      isComplete: Boolean(selectedBouquet),
      isAvailable: true,
    },
    {
      key: "main",
      label: "2. Main Flowers",
      isComplete: Boolean(selectedBouquet) && totalMains === requiredMainCount,
      isAvailable: Boolean(selectedBouquet),
    },
    {
      key: "filler",
      label: "3. Fillers",
      isComplete: baseBuildReady || Boolean(selectedBouquet) && totalFillers === requiredFillerCount,
      isAvailable: Boolean(selectedBouquet) && totalMains === requiredMainCount,
    },
    {
      key: "addOns",
      label: "4. Add-ons",
      isComplete: selectedAddOns.length > 0,
      isAvailable: Boolean(baseBuildReady),
    },
    {
      key: "personal",
      label: "5. Personal Touch",
      isComplete: greetingCard && Boolean(greetingMessage.trim()),
      isAvailable: Boolean(baseBuildReady),
    },
  ];

  const updateCounter = (setter, id, nextValue) => {
    setAdded(false);
    setter((prev) => ({
      ...prev,
      [id]: Math.max(0, nextValue),
    }));
  };

  const handleBouquetSelect = (product) => {
    const isSameBouquet = selectedBouquet?.id === product.id;

    setAdded(false);
    setSelectedBouquet(isSameBouquet ? null : product);
    setMainCounts({});
    setFillerCounts({});
    setAdditionalCounts({});
    setGreetingCard(false);
    setGreetingMessage("");

    if (isSameBouquet) {
      scrollToSection(bouquetSectionRef);
      return;
    }

    if (Number(product.required_main_count ?? 1) > 0) {
      scrollToSection(mainSectionRef);
      return;
    }

    if (Number(product.required_filler_count ?? 2) > 0) {
      scrollToSection(fillerSectionRef);
      return;
    }

    scrollToSection(addOnSectionRef);
  };

  const handleMainAdd = (id) => {
    if (totalMains >= requiredMainCount) {
      if (requiredFillerCount > 0) {
        scrollToSection(fillerSectionRef);
      }
      return;
    }

    const nextTotal = totalMains + 1;
    updateCounter(setMainCounts, id, (mainCounts[id] || 0) + 1);

    if (nextTotal === requiredMainCount) {
      if (requiredFillerCount > 0) {
        scrollToSection(fillerSectionRef);
        return;
      }

      scrollToSection(addOnSectionRef);
    }
  };

  const handleFillerAdd = (id) => {
    if (totalMains < requiredMainCount) {
      scrollToSection(mainSectionRef);
      return;
    }

    if (totalFillers >= requiredFillerCount) {
      scrollToSection(addOnSectionRef);
      return;
    }

    const nextTotal = totalFillers + 1;
    updateCounter(setFillerCounts, id, (fillerCounts[id] || 0) + 1);

    if (nextTotal === requiredFillerCount) {
      scrollToSection(addOnSectionRef);
    }
  };

  const handleAddToCart = () => {
    if (greetingCard) {
      const nextGreetingError = validateGreetingCardMessage(greetingMessage);
      setGreetingError(nextGreetingError);
      if (nextGreetingError) {
        scrollToSection(personalSectionRef);
        return;
      }
    }

    if (!canAddToCart) {
      return;
    }

    customItemCounterRef.current += 1;

    const items = [
      { ...selectedBouquet, quantity: 1 },
      ...selectedMains.map((item) => ({ ...item, free: true })),
      ...selectedFillers.map((item) => ({ ...item, free: true })),
      ...selectedAddOns,
    ];

    addToCart(
      {
        id: `custom-${selectedBouquet.id}-${customItemCounterRef.current}`,
        type: "custom",
        name: "Custom Bouquet",
        description: [
          selectedBouquet.name,
          ...selectedMains.map((item) => `${item.name} x${item.quantity}`),
          ...selectedFillers.map((item) => `${item.name} x${item.quantity}`),
          ...selectedAddOns.map((item) => `${item.name} x${item.quantity}`),
        ].join(", "),
        price: totalPrice,
        image: selectedBouquet.image,
        items,
        greetingCard: greetingCard ? greetingMessage.trim() : null,
        builderSummary: {
          bouquet: { name: selectedBouquet.name, quantity: 1 },
          mains: selectedMains.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            free: true,
            type: item.type,
          })),
          fillers: selectedFillers.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            free: true,
            type: item.type,
          })),
          addOns: selectedAddOns.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price) || 0,
            free: false,
            type: item.type,
          })),
        },
      },
      1
    );

    setAdded(true);
    window.setTimeout(() => {
      navigate("/cart");
    }, 700);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf9]">
        <p className="animate-pulse text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf9] px-6 pb-32 pt-10 md:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-6 border-b border-gray-100 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/order")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#4f6fa5]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to order options
            </button>
            <h1 className="text-4xl font-playfair font-bold text-gray-900 md:text-5xl">
              Custom Products
            </h1>
            {selectedSchedule && (
              <p className="mt-3 text-sm text-gray-500">
                For{" "}
                <span className="font-semibold text-gray-900">
                  {selectedSchedule.schedule_name}
                </span>
              </p>
            )}
          </div>
          <div className="max-w-xl space-y-3">
            <p className="text-sm leading-relaxed text-gray-500">
              Build your perfect arrangement in a few simple steps: select a bouquet wrapper, 
              then tap the cards to fill your included main and filler flowers. Once your base 
              is complete, customize it further with premium add-ons and a personalized 
              greeting card before adding it to your cart!
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {steps.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => {
                if (!step.isAvailable) {
                  return;
                }

                scrollToSection(stepRefs[step.key]);
              }}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${
                currentStepKey === step.key
                  ? "border-[#4f6fa5] bg-[#4f6fa5] text-white shadow-sm"
                  : step.isComplete
                    ? "border-[#4f6fa5]/20 bg-[#4f6fa5]/10 text-[#4f6fa5]"
                    : step.isAvailable
                      ? "border-gray-200 bg-white text-gray-600 hover:border-[#4f6fa5]/30 hover:text-[#4f6fa5]"
                      : "cursor-not-allowed border-gray-200 bg-white text-gray-300"
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="mb-10 rounded-3xl border border-[#4f6fa5]/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#4f6fa5]">
                Selected Product
              </p>
              <p className="mt-1 text-lg font-playfair font-bold text-gray-900">
                {currentStepKey === "bouquet" && "Choose your bouquet wrapper"}
                {currentStepKey === "main" &&
                  `Tap ${requiredMainCount - totalMains} more main flower${requiredMainCount - totalMains === 1 ? "" : "s"}`}
                {currentStepKey === "filler" &&
                  `Tap ${requiredFillerCount - totalFillers} more filler${requiredFillerCount - totalFillers === 1 ? "" : "s"}`}
                {currentStepKey === "addOns" && "Add any extras you want before checkout"}
                {currentStepKey === "personal" && "Add your card message if you want one"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-[#fcfaf9] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Bouquet
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {selectedBouquet ? "Ready" : "Pending"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fcfaf9] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Main
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {totalMains}/{requiredMainCount}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fcfaf9] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Fillers
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {totalFillers}/{requiredFillerCount}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fcfaf9] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Total
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  ₱{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-14">
          <section ref={bouquetSectionRef}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-playfair font-bold text-gray-900">
                Promo Bouquet
              </h2>
              {selectedBouquet && (
                <span className="rounded-full bg-[#4f6fa5]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#4f6fa5]">
                  Selected
                </span>
              )}
            </div>
            {bouquets.length === 0 ? (
              <p className="py-12 text-gray-400">
                No bouquets match the current search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {bouquets.map((product) => (
                  <BouquetCard
                    key={product.id}
                    product={product}
                    isSelected={selectedBouquet?.id === product.id}
                    onSelect={handleBouquetSelect}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            ref={mainSectionRef}
            className={!selectedBouquet ? "pointer-events-none opacity-45" : ""}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900">
                  Main Flowers
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Tap each card to add one included flower
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {totalMains}/{requiredMainCount}
              </span>
            </div>
            {mainFlowers.length === 0 ? (
              <p className="py-12 text-gray-400">
                No main flowers match the current search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {mainFlowers.map((product) => (
                  <SelectionCard
                    key={product.id}
                    product={product}
                    quantity={mainCounts[product.id] || 0}
                    onAdd={handleMainAdd}
                    onRemove={(id) =>
                      updateCounter(setMainCounts, id, (mainCounts[id] || 0) - 1)
                    }
                    disableAdd={totalMains >= requiredMainCount}
                    subtitle="Included in bouquet"
                    helperText="Tap card to add"
                  />
                ))}
              </div>
            )}
          </section>

          <section
            ref={fillerSectionRef}
            className={
              !selectedBouquet || totalMains !== requiredMainCount
                ? "pointer-events-none opacity-45"
                : ""
            }
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900">
                  Fillers
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Tap each card to add one included filler
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {totalFillers}/{requiredFillerCount}
              </span>
            </div>
            {fillers.length === 0 ? (
              <p className="py-12 text-gray-400">
                No fillers match the current search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {fillers.map((product) => (
                  <SelectionCard
                    key={product.id}
                    product={product}
                    quantity={fillerCounts[product.id] || 0}
                    onAdd={handleFillerAdd}
                    onRemove={(id) =>
                      updateCounter(
                        setFillerCounts,
                        id,
                        (fillerCounts[id] || 0) - 1
                      )
                    }
                    disableAdd={totalFillers >= requiredFillerCount}
                    subtitle="Included in bouquet"
                    helperText="Tap card to add"
                  />
                ))}
              </div>
            )}
          </section>

          <section
            ref={addOnSectionRef}
            className={!baseBuildReady ? "pointer-events-none opacity-45" : ""}
          >

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900">
                  Add-ons
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Optional extras, including extra mains and fillers
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                ₱{addOnTotal.toLocaleString()} extra
              </span>
            </div>
            {addOns.length === 0 ? (
              <p className="py-12 text-gray-400">
                No add-ons match the current search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {addOns.map((product) => (
                  <SelectionCard
                    key={product.id}
                    product={product}
                    quantity={additionalCounts[product.id] || 0}
                    onAdd={(id) =>
                      updateCounter(
                        setAdditionalCounts,
                        id,
                        (additionalCounts[id] || 0) + 1
                      )
                    }
                    onRemove={(id) =>
                      updateCounter(
                        setAdditionalCounts,
                        id,
                        (additionalCounts[id] || 0) - 1
                      )
                    }
                    subtitle={`+₱${Number(product.price).toLocaleString()}`}
                    helperText="Tap card to add"
                  />
                ))}
              </div>
            )}
          </section>

          <section
            ref={personalSectionRef}
            className={!baseBuildReady ? "pointer-events-none opacity-45" : ""}
          >
            <div className="mb-6">
              <h2 className="text-3xl font-playfair font-bold text-gray-900">
                Personal Touch
              </h2>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Add a greeting card
              </p>
            </div>

            <div className="max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Greeting card</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Include a personal message for an additional ₱
                    {GREETING_CARD_PRICE}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdded(false);
                    setGreetingCard((prev) => !prev);
                    setGreetingError("");

                    if (greetingCard) {
                      setGreetingMessage("");
                    }
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    greetingCard ? "bg-[#4f6fa5]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      greetingCard ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {greetingCard && (
                <div className="mt-6">
                  <div className="mb-2 flex justify-between">
                    <div className="w-full">
                      <FormFieldHeader
                        label="Greeting Card Message"
                        required
                        error={greetingError}
                        count={greetingMessage.length}
                        max={MAX_GREETING_CHARS}
                      />
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={greetingMessage}
                    onChange={(event) => {
                      if (event.target.value.length <= MAX_GREETING_CHARS) {
                        setAdded(false);
                        setGreetingMessage(event.target.value);
                        setGreetingError("");
                      }
                    }}
                    placeholder="Write your heartfelt message here..."
                    className={getValidationInputClassName({
                      hasError: !!greetingError,
                      baseClassName:
                        "w-full resize-none rounded-2xl border px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2",
                      validClassName: "border-gray-200 bg-gray-50 focus:border-[#4f6fa5] focus:ring-[#4f6fa5]/15",
                      invalidClassName: "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100",
                    })}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <div
          className={`fixed bottom-8 left-1/2 z-50 w-[92%] -translate-x-1/2 md:w-auto ${
            selectedBouquet ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex min-w-0 flex-col gap-4 rounded-[28px] bg-gray-900 px-6 py-4 text-white shadow-2xl md:min-w-[620px] md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                {canAddToCart ? "Ready to add" : "Finish the required build first"}
              </p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <p className="truncate text-lg font-playfair font-bold">
                  {selectedBouquet?.name || "Custom Bouquet"}
                </p>
                <p className="text-xl font-bold">₱{totalPrice.toLocaleString()}</p>
              </div>
              <p className="mt-2 text-sm text-white/70">
                {canAddToCart
                  ? "Your bouquet is complete. Add it to cart whenever you are ready."
                  : `Mains ${totalMains}/${requiredMainCount} • Fillers ${totalFillers}/${requiredFillerCount}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart || added}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : canAddToCart
                    ? "bg-white text-gray-900 hover:bg-[#4f6fa5] hover:text-white"
                    : "cursor-not-allowed bg-white/10 text-white/60"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? "Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCustom;
