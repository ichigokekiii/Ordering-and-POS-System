import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

function LandingPage() {
  const [landing, setLanding] = useState(null);
  const [products, setProducts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Load landing content
    api.get("/landing")
      .then(res => setLanding(res.data))
      .catch(() => console.error("Failed to load landing"));

    // Load popular products
    api.get("/products")
      .then(res => setProducts(res.data.slice(0, 4)))
      .catch(() => console.error("Failed to load products"));

    // Load featured schedules
    api.get("/schedules")
      .then(res => setSchedules(res.data.slice(0, 2)))
      .catch(() => console.error("Failed to load schedules"));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!landing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] overflow-hidden">

        {/* Slides Wrapper */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {[ 
            landing.hero_image || "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
          ].map((image, index) => (
            <div
              key={index}
              className="relative flex h-[80vh] w-full flex-shrink-0 items-center justify-center bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="absolute inset-0 bg-black/50"></div>

              <div className="relative z-10 max-w-2xl px-6 text-center text-white">
                <h1 className="text-4xl font-bold md:text-5xl">
                  {landing.title}
                </h1>

                <p className="mt-4 text-lg opacity-90">
                  {landing.subtitle}
                </p>

                <button className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-200">
                  Browse Flowers
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition ${
                currentSlide === index
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

      </section>

      {/* POPULAR PRODUCTS */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-gray-800">
          Popular Products
        </h2>

        <div className="grid gap-8 md:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group">
              <img
                src={product.image || "https://via.placeholder.com/300"}
                alt={product.name}
                className="h-64 w-full rounded-xl object-cover transition group-hover:scale-105"
              />
              <h3 className="mt-3 text-sm font-medium text-gray-800">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                ₱{product.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SCHEDULES */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="mb-10 text-3xl font-bold text-gray-800">
            Featured Schedules
          </h2>

          <div className="grid gap-12 md:grid-cols-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="group">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={schedule.image || "https://via.placeholder.com/600x300"}
                    alt={schedule.title}
                    className="h-72 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {schedule.schedule_name}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {schedule.schedule_description}
                  </p>

                  <Link
                    to="/schedule"
                    className="mt-5 inline-block rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-900 hover:text-white"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
