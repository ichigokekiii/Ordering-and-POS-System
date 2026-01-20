import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function LandingPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get("/landing")
      .then((res) => {
        setContent(res.data);
      })
      .catch(() => {
        console.error("Failed to load landing content");
      });
  }, []);

  if (!content)
    return (
      <>
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-8 py-24 md:flex-row">
        
        {/* Text 1 */}
        <div className="flex-1">
          <h1 className="text-4xl font-semibold leading-tight text-gray-800 md:text-5xl">
            {content.title}
          </h1>

          <p className="mt-6 max-w-md text-gray-500">
            {content.subtitle}
          </p>

          <button className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700">
            Browse Flowers
          </button>
        </div>

        {/* Image 1 */}
        <div className="flex-1">
          <img
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9"
            alt="Flower bouquet"
            className="w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      {/* Text Below Hero */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 text-center md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Fresh & Handpicked
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              Carefully arranged bouquets using the freshest blooms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Simple Ordering
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              Easy browsing and fast checkout for every occasion.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Made for Every Moment
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              Perfect flowers for celebrations or simple surprises.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
