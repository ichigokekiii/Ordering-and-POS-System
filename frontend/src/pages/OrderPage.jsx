import { useNavigate } from "react-router-dom";


function OrderPage() {
  const navigate = useNavigate();


  return (
    <>


      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-8 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">

          {/* Premades Card */}
          <button
            onClick={() => navigate("/orderpremade")}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="h-80 w-80 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1490750967868-88aa4486c946"
                alt="Premade Bouquets"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">Premades</h2>
              <p className="mt-2 text-sm text-gray-500">
                Choose from our ready-made bouquets
              </p>
            </div>
          </button>

          {/* Custom Made Card */}
          <button
            onClick={() => navigate("/ordercustom")}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="h-80 w-80 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd"
                alt="Custom Made Bouquets"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">Custom Made</h2>
              <p className="mt-2 text-sm text-gray-500">
                Create your own personalized bouquet
              </p>
            </div>
          </button>

        </div>
      </div>
    </>
  );
}

export default OrderPage;