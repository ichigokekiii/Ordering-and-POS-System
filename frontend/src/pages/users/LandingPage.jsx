import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { useContents } from "../../contexts/ContentContext";

function LandingPage() {
  const contentContext = useContents();
  const contents = contentContext?.contents || [];

  const [landing, setLanding] = useState(null);
  const [products, setProducts] = useState([]);
  const [premades, setPremades] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const getContentValue = (identifier, fallback = "") => {
    const item = contents.find(
      (c) =>
        c.identifier === identifier &&
        c.page === "home" &&
        !c.isArchived
    );

    if (!item) {
      console.log("CMS MISS:", identifier);
      return fallback;
    }

    console.log("CMS HIT:", identifier, item);

    if (item.type === "text") return item.content_text;
    if (item.type === "image")
      return item.content_image;

    return fallback;
  };

  useEffect(() => {
    // Load landing content
    api.get("/landing")
      .then(res => setLanding(res.data))
      .catch(() => console.error("Failed to load landing"));

    // Load popular products
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(() => console.error("Failed to load products"));

    api.get("/premades")
      .then(res => setPremades(res.data))
      .catch(() => console.error("Failed to load premades"));

    // Load featured schedules
    api.get("/schedules")
      .then(res => setSchedules(res.data))
      .catch(() => console.error("Failed to load schedules"));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const bannerCount = contents.filter(
          (c) =>
            c.page === "home" &&
            c.identifier.includes("hero_image") &&
            !c.isArchived &&
            c.content_image
        ).length;

        const maxSlides = bannerCount >= 1 ? bannerCount : 3;

        return prev === maxSlides - 1 ? 0 : prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [contents]);

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

        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {(() => {
            const bannerItems = contents
              .filter(
                (c) =>
                  c.page === "home" &&
                  c.identifier.includes("hero_image") &&
                  !c.isArchived &&
                  c.content_image
              )
              .sort((a, b) => a.identifier.localeCompare(b.identifier));

            const images =
              bannerItems.length >= 1
                ? bannerItems.map((b) => `http://localhost:8000${b.content_image}`)
                : [
                    landing.hero_image,
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
                    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
                  ];

            return images.map((image, index) => (
              <div
                key={index}
                className="relative flex h-[80vh] w-full flex-shrink-0 items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: image ? `url(${image})` : "none",
                }}
              >
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative z-10 max-w-3xl px-6 text-center text-white">
                  <h1 className="text-5xl font-bold leading-tight md:text-6xl">
                    {getContentValue("hero_title", landing.title)}
                  </h1>

                  <p className="mt-4 text-lg opacity-90">
                    {getContentValue("hero_subtitle", landing.subtitle)}
                  </p>

                  <button className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-200">
                    Browse Flowers
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
          {(() => {
            const bannerCount = contents.filter(
              (c) =>
                c.page === "home" &&
                c.identifier.includes("hero_image") &&
                !c.isArchived &&
                c.content_image
            ).length;

            const total = bannerCount >= 1 ? bannerCount : 3;

            return Array.from({ length: total }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 w-3 rounded-full transition ${
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ));
          })()}
        </div>
      </section>

      {/* INTRO STATEMENT SECTION */}
      <section className="bg-[#f5f7fb] py-20">
        <div className="mx-auto max-w-5xl px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {getContentValue("intro_title", "The Flower Shop that will never fail you")}
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {getContentValue("intro_text", "We carefully craft every bouquet to match your moment — whether it's love, celebration, gratitude, or comfort. Fresh flowers, thoughtfully arranged.")}
          </p>
        </div>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="mx-auto max-w-7xl px-8 py-20">
        <h2 className="mb-10 text-3xl font-bold text-gray-900">
          Popular Products
        </h2>

        <div className="flex gap-8 overflow-x-auto scroll-smooth pb-4">
          {[...products, ...premades].map((item) => (
            <div key={`${item.id}-${item.name}`} className="w-64 flex-shrink-0 group cursor-pointer">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={item.image || "https://via.placeholder.com/300"}
                  alt={item.name}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                {item.name}
              </h3>

              <p className="text-sm text-gray-500">
                ₱{item.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PROMO SPLIT SECTION */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-8 md:grid-cols-2">
          
          <div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              {getContentValue("promo_title", "Fresh Flowers made specially for you")}
            </h2>
            <p className="mt-6 text-gray-600">
              {getContentValue("promo_text", "Every bouquet is handcrafted with precision and care. We source locally and arrange passionately to bring joy to every doorstep.")}
            </p>
            <button className="mt-8 rounded-full bg-[#4f6fa5] px-8 py-3 text-white font-semibold hover:bg-[#3f5b89] transition">
              Shop Now
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl">
            <img
              src={getContentValue("promo_image", "")}
              alt="Flower arrangement"
              className="h-[500px] w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* FEATURED SCHEDULES */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">
            Featured Schedules
          </h2>

          <div className="flex gap-10 overflow-x-auto scroll-smooth pb-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="w-72 flex-shrink-0 group cursor-pointer">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={schedule.image || "https://via.placeholder.com/600x300"}
                    alt={schedule.schedule_name}
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {schedule.schedule_name}
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {schedule.schedule_description}
                </p>

                <Link
                  to="/schedule"
                  className="mt-4 inline-block rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-900 hover:text-white"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE CATEGORIES */}
      <section className="mx-auto max-w-7xl px-8 py-20">
        <h2 className="mb-10 text-3xl font-bold text-gray-900">
          Explore Categories
        </h2>

        <div className="flex gap-6 overflow-x-auto scroll-smooth pb-4">
          {[
            {
              name: "Roses",
              image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946"
            },
            {
              name: "Sunflowers",
              image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
            },
            {
              name: "Carnations",
              image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
            },
            {
              name: "Chrysanthemums",
              image: "https://images.unsplash.com/photo-1464983953574-0892a716854b9"
            },
            {
              name: "Gerberas",
              image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            }
          ].map((category, index) => (
            <div key={index} className="min-w-[180px] max-w-[180px] flex-shrink-0 group cursor-pointer">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={category.image}
                  alt={category.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
