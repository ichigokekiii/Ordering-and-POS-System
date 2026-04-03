import { useState } from "react";
import OrderPremadePage from "./OrderPremade";
import OrderCustom from "./OrderCustom";
import OrderCustomAdditional from "./OrderCustomAdditional";

function OrderPage() {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState(null);

  // Shared order data
  const [orderData, setOrderData] = useState({
    bouquet: null,
    mains: [],
    fillers: [],
    basePrice: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* STEP 1 — Choose Type */}
      {step === 1 && (
        <div className="flex min-h-screen items-center justify-center px-8 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">

            {/* Premades */}
            <button
              onClick={() => {
                setOrderType("premade");
                setStep(2);
              }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="h-80 w-80 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1490750967868-88aa4486c946"
                  className="h-full w-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold">Premades</h2>
                <p className="text-sm text-gray-500">
                  Choose from ready-made bouquets
                </p>
              </div>
            </button>

            {/* Custom */}
            <button
              onClick={() => {
                setOrderType("custom");
                setStep(2);
              }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="h-80 w-80 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd"
                  className="h-full w-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold">Custom Made</h2>
                <p className="text-sm text-gray-500">
                  Build your own bouquet
                </p>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* STEP 2 — Premade */}
      {step === 2 && orderType === "premade" && (
        <OrderPremadePage
          onBack={() => setStep(1)}
        />
      )}

      {/* STEP 2 — Custom */}
      {step === 2 && orderType === "custom" && (
        <OrderCustom
          onBack={() => setStep(1)}
          onNext={(data) => {
            setOrderData(data);
            setStep(3);
          }}
        />
      )}

      {/* STEP 3 — Additional */}
      {step === 3 && (
        <OrderCustomAdditional
          data={orderData}
          onBack={() => setStep(2)}
          onFinish={() => setStep(1)}
        />
      )}

    </div>
  );
}

export default OrderPage;
