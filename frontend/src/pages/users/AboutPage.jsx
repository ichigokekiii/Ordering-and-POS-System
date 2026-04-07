/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useContents } from "../../contexts/ContentContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../../cms/cmsRegistry";

function AboutPage({ cmsPreview }) {
  const { contents } = useContents();

  // helper to read CMS values
  const getContentValue = (key, defaultValue) =>
    getCmsContentValue(contents, "about", key, defaultValue);

  const [openFaq, setOpenFaq] = useState(null);

  const [stats, setStats] = useState({
    deliveries: 0,
    florists: 0,
    years: 0,
  });

  useEffect(() => {
    const target = {
      deliveries: 15840,
      florists: 120,
      years: 22,
    };

    let frame = 0;
    const duration = 40; // controls speed (higher = slower)

    const interval = setInterval(() => {
      frame++;

      setStats({
        deliveries: Math.floor(Math.random() * target.deliveries),
        florists: Math.floor(Math.random() * target.florists),
        years: Math.floor(Math.random() * target.years),
      });

      if (frame >= duration) {
        setStats(target);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const team = [
    {
      name: "Apphia",
      role: "Co-Founder & Lead Florist",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300",
    },
    {
      name: "Pearl",
      role: "Co-Founder & Operations",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
    },
    {
      name: "Carter Oliver",
      role: "Delivery Manager",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300",
    },
    {
      name: "Buster Carson",
      role: "Customer Support",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
    },
    {
      name: "Sarah Mitchell",
      role: "Floral Designer",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
    },
  ];

  const faqs = [
    {
      q: "Do you offer same-day delivery?",
      a: "Yes, we offer same day delivery for orders placed before 2 PM local time. Our speedy courier service guarantees freshness upon arrival.",
    },
    {
      q: "Can I customize a bouquet?",
      a: "Absolutely! Our florists would love to work with you to craft the perfect bespoke arrangement for your special occasion.",
    },
    {
      q: "Where do you source your flowers?",
      a: "We proudly source our blooms from local, sustainable farms, ensuring our carbon footprint remains small while supporting community agriculture.",
    },
    {
      q: "What is your return policy?",
      a: "Due to the perishable nature of our products, we do not accept returns. However, if your order arrives damaged, we will replace it immediately.",
    },
  ];

  return (
    <div className="bg-[#fcfaf9] text-gray-900 font-sans min-h-screen overflow-x-hidden pt-20 pb-0">
      {/* 1. HUMBLE BEGINNINGS (Hero & Stats) */}
      <section className="max-w-[1400px] mx-auto px-6  md:px-12 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-sm mb-4">
              Our Story
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-gray-900 leading-[1.05] tracking-tight mb-8">
              Explore our
              <br />
              <span className="block font-dancing text-[#4f6fa5] font-normal text-6xl md:text-8xl lg:text-9xl leading-[0.9] mt-3 lg:ml-2 transform -rotate-2">
                humble beginnings
              </span>
            </h1>
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("about", "about_mission_text")}
            >
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
                {getContentValue(
                  "about_mission_text",
                  "We strive to set new standards in floristry, efficiency, and sustainability by using advanced sourcing techniques. Whether it's a grand celebration or a simple gesture, we are dedicated to perfection in every petal.",
                )}
              </p>
            </CmsEditableRegion>
            <Link
              to="/products"
              onClick={(event) => cmsPreview?.enabled && event.preventDefault()}
              className="inline-block border-2 border-gray-900 text-white rounded-full px-10 py-4 font-bold tracking-widest uppercase text-sm bg-gray-900 hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Shop Collections
            </Link>
          </motion.div>

          {/* Right: Image & Bento Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 grid grid-cols-3 gap-2 h-[520px] lg:h-[640px] relative"
          >
            {/* Tall Main Image */}
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("about", "about_hero_image_1")}
              className="col-span-2 row-span-3 rounded-[2.5rem] overflow-hidden"
            >
              <div className="rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-gray-100 border border-gray-100">
                <img
                  src={getCmsAssetUrl(
                    getContentValue(
                      "about_hero_image_1",
                      "https://images.unsplash.com/photo-1542458567-5491753966ce?q=80&w=1000",
                    ),
                  )}
                  alt="Florist working"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                />
              </div>
            </CmsEditableRegion>

            {/* Text / Stat Box 1 */}
            <div className="col-span-1 row-span-1 flex flex-col justify-center items-center text-center border-2 border-gray-900 rounded-2xl py-5 px-3 transition-all duration-300">
              <h3 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900 mb-1 drop-shadow-sm">
                {stats.deliveries.toLocaleString()}+
              </h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-snug">
                Deliveries Sent
              </p>
            </div>

            {/* Text / Stat Box 2 */}
            <div className="col-span-1 row-span-1 flex flex-col justify-center items-center text-center border-2 border-gray-900 rounded-2xl py-5 px-3 transition-all duration-300">
              <h3 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900 mb-1 drop-shadow-sm">
                {stats.florists}+
              </h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-snug">
                Active Florists
              </p>
            </div>

            {/* Text / Stat Box 3 */}
            <div className="col-span-1 row-span-1 flex flex-col justify-center items-center text-center border-2 border-gray-900 rounded-2xl py-5 px-3 transition-all duration-300">
              <h3 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900 mb-1 drop-shadow-sm">
                {stats.years}+
              </h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-snug">
                Years Experience
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. THE PEOPLE BEHIND IT ALL (Marquee) */}
      <section className="py-24 bg-white border-y border-gray-100 shadow-[0_0_50px_rgba(0,0,0,0.015)] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 text-center">
          <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-sm mb-4">
            Our Team
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-gray-900 mb-6">
            The people behind it all
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Meet the dedicated and passionate team that carefully crafts every
            bouquet and guarantees perfect delivery.
          </p>
        </div>

        <div className="relative w-full flex overflow-visible py-8">
          {/* Auto scrolling track */}
          <div className="flex animate-marquee whitespace-nowrap w-max hover:[animation-play-state:paused]">
            {/* Duplicated thrice to ensure seamless endless scrolling */}
            {[...team, ...team, ...team].map((person, i) => (
              <div
                key={i}
                className="inline-block w-[280px] md:w-[320px] mx-4 md:mx-6 group cursor-pointer perspective"
              >
                <div className="bg-[#fcfaf9] border border-gray-100 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:border-blue-50 transition-all duration-500 hover:-translate-y-2">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden mb-8 ring-4 ring-offset-8 ring-[#eaf2ff] group-hover:ring-[#4f6fa5] transition-all duration-500">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2 truncate w-full">
                    {person.name}
                  </h3>
                  <p className="text-xs font-bold text-[#4f6fa5] uppercase tracking-widest truncate w-full">
                    {person.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES */}
      <section className="py-32 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-gray-900 mb-20">
          Our Services for you
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {[
            {
              title: getContentValue("about_service_1", "Custom Flowers"),
              titleField: "about_service_1",
              desc: "Fully bespoke arrangements crafted for your aesthetic.",
              image: getContentValue(
                "about_service_image_1",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000",
              ),
              imageField: "about_service_image_1",
            },
            {
              title: getContentValue("about_service_2", "Pop-up Stores"),
              titleField: "about_service_2",
              desc: "Find us in vibrant local markets and events.",
              image: getContentValue(
                "about_service_image_2",
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000",
              ),
              imageField: "about_service_image_2",
            },
            {
              title: getContentValue("about_service_3", "Secret Delivery"),
              titleField: "about_service_3",
              desc: "Surprise deliveries with a mysterious touch.",
              image: getContentValue(
                "about_service_image_3",
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000",
              ),
              imageField: "about_service_image_3",
            },
            {
              title: "Event Styling",
              desc: "Elegant floral styling for special occasions.",
              image:
                "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1000",
            },
            {
              title: "Corporate Gifts",
              desc: "Premium floral gifts for businesses.",
              image:
                "https://images.unsplash.com/photo-1490750967868-88cb4aca2033?q=80&w=1000",
            },
          ].map((service, index) => (
            <motion.div
              whileHover={{ y: -10 }}
              style={{ marginTop: index % 2 === 0 ? "0px" : "40px" }}
              key={index}
              className="relative rounded-[1.8rem] overflow-hidden h-[260px] md:h-[280px] group cursor-pointer"
            >
              {service.imageField ? (
                <CmsEditableRegion
                  cmsPreview={cmsPreview}
                  field={getCmsField("about", service.imageField)}
                  className="absolute inset-0"
                  overlayClassName="rounded-[inherit]"
                >
                    <img
                      src={getCmsAssetUrl(service.image)}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                </CmsEditableRegion>
              ) : (
                  <img
                    src={getCmsAssetUrl(service.image)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500"></div>

              <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                {service.titleField ? (
                  <CmsEditableRegion
                    cmsPreview={cmsPreview}
                    field={getCmsField("about", service.titleField)}
                    className="inline-block"
                  >
                    <h3 className="text-xl md:text-2xl font-playfair font-bold mb-2">
                      {service.title}
                    </h3>
                  </CmsEditableRegion>
                ) : (
                  <h3 className="text-xl md:text-2xl font-playfair font-bold mb-2">
                    {service.title}
                  </h3>
                )}
                <p className="text-xs md:text-sm opacity-90 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="relative pt-32 pb-24 mb-0 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-sm font-semibold text-[#4f6fa5] uppercase tracking-widest mb-4">
              FAQs
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-gray-900 leading-tight">
              Frequently Asked <br className="hidden md:block" />
              Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`border rounded-[1.5rem] overflow-hidden transition-all duration-300 ${isOpen ? "border-gray-900 bg-white" : "border-gray-200 bg-white hover:border-gray-400"}`}
                >
                  <button
                    onClick={() => {
                      if (!cmsPreview?.enabled) {
                        setOpenFaq(isOpen ? null : index);
                      }
                    }}
                    className="w-full px-8 py-8 text-left flex justify-between items-center focus:outline-none"
                  >
                    <span
                      className={`font-bold text-lg md:text-xl pr-8 transition-colors ${isOpen ? "text-gray-900" : "text-gray-900"}`}
                    >
                      {faq.q}
                    </span>
                    <span
                      className={`flex-shrink-0 transition-transform duration-500 transform ${isOpen ? "rotate-180 text-gray-900" : "rotate-0 text-gray-400"}`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="px-8 pb-8 text-gray-600 leading-relaxed text-sm md:text-lg border-t border-gray-100 pt-6 overflow-visible"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div className="h-0 m-0 p-0"></div>

      {/* Global CSS for Marquee and Fade Mask */}
      <style>{`
        .animate-marquee { 
           animation: marquee 35s linear infinite; 
           will-change: transform;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33333%); }
        }

        /* Adds a nice fade off effect on the left and right bounds of the scrolling marquee container */
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
}

export default AboutPage;
