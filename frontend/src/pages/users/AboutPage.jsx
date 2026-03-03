import { useEffect, useState } from "react";

function AboutPage() {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1526045478516-99145907023c",
      title: "Fresh Flowers",
      subtitle: "Made Just For You",
      description: "Open 24/7 • 1234 Culinary Blvd, Flavor Town",
    },
    {
      image:
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
      title: "Handcrafted Bouquets",
      subtitle: "For Every Occasion",
      description: "Weddings • Birthdays • Anniversaries",
    },
    {
      image:
        "https://images.unsplash.com/photo-1468327768560-75b778cbb551",
      title: "Locally Sourced",
      subtitle: "Sustainably Grown",
      description: "Supporting Local Flower Farmers",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-white text-gray-800">
      {/* HERO SECTION */}
      <div className="relative w-full h-[600px] md:h-[650px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 flex items-center justify-center text-center">
              <div className="text-white px-6 max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                  {slide.title}
                </h1>
                <h2 className="text-2xl md:text-3xl font-light mt-3">
                  {slide.subtitle}
                </h2>
                <p className="mt-6 text-sm md:text-base opacity-90 tracking-wide">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* PAGINATION DOTS */}
        <div className="absolute bottom-6 w-full flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* MISSION SECTION */}
      <div className="py-24 px-6 text-center max-w-4xl mx-auto">
        <p className="text-gray-600 text-lg leading-relaxed">
          Our mission is to deliver the freshest, most beautiful bouquets
          right to your door, focusing on sustainable practices and
          locally sourced flowers.
        </p>

        <div className="mt-8">
          <p className="italic text-2xl font-light tracking-wide">Apphia and Pearl</p>
          <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">Founders</p>
        </div>
      </div>

      {/* SERVICES SECTION (from old design, restyled) */}
      <div className="py-24 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-14">
          Services made for You
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {[
            { title: "Custom Flowers" },
            { title: "Pop-up Stores" },
            { title: "Secret Delivery" },
          ].map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-10 text-center"
            >
              <div className="h-32 w-32 mx-auto mb-6 rounded-xl bg-[#eef2f8]" />
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-500 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* STORY SECTION */}
      <div className="relative h-[500px] md:h-[550px]">
        <img
          src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
          alt="flowers story"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
          <div className="max-w-4xl px-10 text-white">
            <h2 className="text-3xl md:text-5xl font-light leading-snug tracking-tight">
              Founded in 2010, Petal Express has blossomed into a leading
              flower delivery service, celebrated for quality and
              innovation.
            </h2>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center">
            What Our Customers Are Saying
          </h2>

          <div className="w-24 h-1 bg-[#4f6fa5] mx-auto mt-4 rounded-full" />

          <div className="grid gap-8 md:grid-cols-4 mt-16">
            {[
              { name: "Dylan Field", role: "CEO at Figma", text: "The flowers were fresh and stunning. They brightened my entire day!" },
              { name: "Poppy Petals", role: "Florist", text: "Fast delivery and absolutely gorgeous arrangements!" },
              { name: "Sophie R.", role: "Blogger", text: "Petal Express is truly a breath of fresh air." },
              { name: "Noah V.", role: "Entrepreneur", text: "Petal Express always delivers smiles!" },
            ].map((review, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 rounded-full bg-[#4f6fa5] text-white flex items-center justify-center font-semibold">
                    {review.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.role}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  “{review.text}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="py-24 px-6 text-center bg-white">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">Contact Us</h2>
        <p className="text-gray-500 mb-12 max-w-xl mx-auto">
          We'd love to hear from you! Whether you have questions,
          feedback, or just want to say hi.
        </p>

        <form className="max-w-3xl mx-auto space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] transition"
              placeholder="First name"
            />
            <input
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] transition"
              placeholder="Last name"
            />
          </div>

          <input
            className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] transition"
            placeholder="Email"
          />

          <textarea
            rows="4"
            className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] transition"
            placeholder="Message"
          />

          <button
            type="submit"
            className="bg-[#4f6fa5] text-white px-8 py-3 rounded-md hover:bg-[#3f5b89] transition shadow-md hover:shadow-lg"
          >
            Submit
          </button>
        </form>
      </div>

    </div>
  );
}

export default AboutPage;
