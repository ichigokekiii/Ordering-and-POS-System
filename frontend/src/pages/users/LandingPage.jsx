/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { useContents } from "../../contexts/ContentContext";
import { motion, AnimatePresence } from "framer-motion";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../../cms/cmsRegistry";

function LandingPage({ cmsPreview }) {
  const contentContext = useContents();
  const contents = contentContext?.contents || [];

  const [landing, setLanding] = useState(null);
  const [products, setProducts] = useState([]);
  const [premades, setPremades] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const asBoolean = (value) => value === 1 || value === true || value === "1";

  const getContentValue = (identifier, fallback = "") =>
    getCmsContentValue(contents, "home", identifier, fallback);

  const preventPreviewNavigation = (event) => {
    if (!cmsPreview?.enabled) return;
    event.preventDefault();
  };

  useEffect(() => {
    api.get("/landing").then((res) => setLanding(res.data)).catch(() => console.error("Failed to load landing"));
    api.get("/products").then((res) => setProducts(res.data)).catch(() => console.error("Failed to load products"));
    api.get("/premades").then((res) => setPremades(res.data)).catch(() => console.error("Failed to load premades"));
    api.get("/schedules").then((res) => setSchedules(res.data)).catch(() => console.error("Failed to load schedules"));
  }, []);

  const heroDefaults = [
    {
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200",
      title: "Carnations",
      subtitle: "Handcrafted and meticulously curated to convey your deepest sentiments.",
    },
    {
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200",
      title: "Sunflowers",
      subtitle: "Bright, vibrant, and bursting with joy. Perfect for lighting up any room.",
    },
    {
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200",
      title: "Roses",
      subtitle: "Timeless elegance and classic beauty for every romantic occasion.",
    },
  ];

  const heroData = heroDefaults.map((fallbackItem, index) => ({
    id: index,
    image: getCmsAssetUrl(getContentValue(`hero_image_${index + 1}`, fallbackItem.image)),
    title: getContentValue(`hero_title_${index + 1}`, fallbackItem.title),
    subtitle: getContentValue(`hero_subtitle_${index + 1}`, fallbackItem.subtitle),
  }));

  const categoryCards = [
    {
      imageField: "home_category_image_1",
      titleField: "home_category_title_1",
      imageFallback: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800",
      badge: "Collection",
      titleFallback: "Carnation Arrangements",
      layoutClass: "group relative col-span-1 md:col-span-2 md:row-span-2 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer",
      imageClass: "w-full h-[350px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105",
      titleClass: "text-white text-4xl md:text-5xl font-playfair font-bold pr-8",
      contentClass: "absolute bottom-8 left-8 md:bottom-12 md:left-12",
      showHoverText: true,
    },
    {
      imageField: "home_category_image_2",
      titleField: "home_category_title_2",
      imageFallback: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800",
      badge: "Trending",
      titleFallback: "Sunflowers Drops",
      layoutClass: "group relative col-span-1 md:col-span-2 md:row-span-1 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer",
      imageClass: "w-full h-[250px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105",
      titleClass: "text-white text-2xl md:text-3xl font-playfair font-bold",
      contentClass: "absolute bottom-6 left-6 md:bottom-8 md:left-8",
    },
    {
      imageField: "home_category_image_3",
      titleField: "home_category_title_3",
      imageFallback: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800",
      titleFallback: "Classic\nRoses",
      layoutClass: "group relative col-span-1 md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer",
      imageClass: "w-full h-[250px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105",
      titleClass: "text-white text-xl md:text-2xl font-playfair font-bold leading-tight whitespace-pre-line",
      contentClass: "absolute bottom-6 left-6 md:bottom-8 md:left-8",
    },
    {
      imageField: "home_category_image_4",
      titleField: "home_category_title_4",
      imageFallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      titleFallback: "Vibrant\nGerberas",
      layoutClass: "group relative col-span-1 md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer bg-[#eaf2ff]",
      imageClass: "w-full h-[250px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 mix-blend-multiply opacity-90",
      titleClass: "text-white text-xl md:text-2xl font-playfair font-bold leading-tight whitespace-pre-line",
      contentClass: "absolute bottom-6 left-6 md:bottom-8 md:left-8",
    },
  ];

  useEffect(() => {
    if (!heroData || heroData.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroData]);

  if (!landing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfaf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f6fa5]"></div>
      </div>
    );
  }

  const visibleProducts = products.filter((item) => !asBoolean(item.isArchived));
  const visiblePremades = premades.filter((item) => !asBoolean(item.isArchived));
  const visibleSchedules = schedules.filter(
    (item) => !asBoolean(item.isArchived) && asBoolean(item.isAvailable)
  );

  return (
    <div className="bg-[#fcfaf9] text-gray-900 min-h-screen pt-20 pb-12 overflow-x-hidden font-sans">
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 mb-32 -mt-4">
        
        {/* Top Text Block */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-10 items-start mb-12">
          
          {/* FIXED: Added z-[80] to guarantee hits pass through the motion div */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-4xl relative z-[80]">
            
            <div className="mb-4">
               <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_hero_label")} className="relative z-[60] inline-block w-fit pointer-events-auto">
                 <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-sm">
                   {getContentValue("home_hero_label", "Floral Discovery")}
                 </p>
               </CmsEditableRegion>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold leading-[1.15] text-gray-900 tracking-tight flex flex-col items-start gap-1">
              
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_hero_title_intro")} className="relative z-[60] inline-block w-fit pointer-events-auto">
                <span>{getContentValue("home_hero_title_intro", "Discover the perfect")}</span>
              </CmsEditableRegion>
              
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_hero_title_accent")} className="relative z-[60] inline-block w-fit pointer-events-auto">
                <span className="font-dancing text-[#4f6fa5] font-normal leading-[0.85] block mt-1 lg:ml-4 transform -rotate-2 text-6xl md:text-8xl lg:text-9xl">
                  {getContentValue("home_hero_title_accent", "Flowers")}
                </span>
              </CmsEditableRegion>
              
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_hero_title_outro")} className="relative z-[60] inline-block w-fit pointer-events-auto">
                <span className="inline-block mt-2">{getContentValue("home_hero_title_outro", "just for you")}</span>
              </CmsEditableRegion>

            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }} className="hidden lg:flex min-h-[360px] items-center justify-end relative z-[80]">
            <div className="max-w-[320px] pr-2">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_hero_cta_text")} className="inline-block pointer-events-auto">
                <p className="text-base md:text-lg leading-relaxed text-gray-600 font-light">
                  {getContentValue("home_hero_cta_text", "Thoughtfully curated floral arrangements designed to bring softness, beauty, and meaning to every occasion.")}
                </p>
              </CmsEditableRegion>

              <div className="mt-8">
                <Link to="/products" onClick={preventPreviewNavigation} className="group relative flex h-14 w-[200px] items-center rounded-full bg-gray-900 p-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="pointer-events-none absolute left-1 top-1 flex h-12 w-[192px] items-center justify-center pl-6 transition-transform duration-[600ms] ease-[cubic-bezier(0.5,1,0.89,1)] group-hover:-translate-x-4">
                    <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_hero_button_text")} className="inline-block pointer-events-auto">
                      <span className="text-sm font-semibold tracking-wide text-white">{getContentValue("home_hero_button_text", "Shop Now")}</span>
                    </CmsEditableRegion>
                  </div>

                  <div
                    className="relative z-10 flex h-12 w-12 items-center justify-end overflow-hidden rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.5,1,0.89,1)] group-hover:w-full"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <div className="pointer-events-none absolute left-0 top-0 flex h-12 w-[192px] items-center justify-center pl-6 transition-transform duration-[600ms] ease-[cubic-bezier(0.5,1,0.89,1)] group-hover:-translate-x-4">
                      <span className="text-sm font-semibold tracking-wide text-[#111827]">{getContentValue("home_hero_button_text", "Shop Now")}</span>
                    </div>
                    <div className="relative z-20 flex h-12 w-12 shrink-0 items-center justify-center text-[#111827]">
                      <svg className="h-5 w-5 transition-transform duration-[600ms] ease-out group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Expanding Cards (Accordion) Layout */}
        <div className="flex flex-col md:flex-row h-[500px] md:h-[600px] gap-2 lg:gap-4">
          {heroData.map((item, index) => {
            const isActive = heroIndex === index;
            return (
              <div 
                key={index} 
                onClick={() => setHeroIndex(index)}
                className={`group relative rounded-[2rem] md:rounded-[3rem] overflow-hidden cursor-pointer transition-[flex,transform,filter] duration-[800ms] ease-out flex flex-col justify-end ${isActive ? "flex-[4_4_0%] md:flex-[3_3_0%] hover:shadow-2xl" : "flex-[1_1_0%] brightness-75 hover:brightness-100"}`}
              >
                
                <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", `hero_image_${index + 1}`)} className="absolute inset-0 z-10 rounded-[inherit]">
                  <img src={item.image} alt={item.title} className={`h-full w-full object-cover transition-transform duration-[10s] ease-linear ${isActive ? "scale-110" : "scale-100"}`} />
                </CmsEditableRegion>

                <div className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-700 ease-out ${isActive ? "opacity-100" : "opacity-60"}`}></div>

                <div className={`relative z-30 w-full h-full p-6 md:p-10 text-white flex flex-col justify-end pointer-events-none`}>
                  <div className={`w-[80vw] md:w-[40vw] transition-opacity duration-700 ease-out ${isActive ? "opacity-100 delay-100" : "opacity-0 md:opacity-100"} ${!isActive && "md:hidden"}`}>
                    <AnimatePresence mode="popLayout">
                      {isActive && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }} transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }} className="pointer-events-auto">
                          
                          <div className="mb-4">
                            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", `hero_title_${index + 1}`)} className="relative z-40 w-fit inline-block max-w-full">
                              <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold drop-shadow-lg leading-tight" style={{ color: getContentValue("home_hero_card_title_color", "#ffffff") }}>
                                {item.title}
                              </h2>
                            </CmsEditableRegion>
                          </div>
                          
                          <div className="mb-8">
                            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", `hero_subtitle_${index + 1}`)} className="relative z-40 w-fit inline-block max-w-full">
                              <p className="text-sm md:text-lg lg:text-xl md:w-3/4 leading-relaxed font-light drop-shadow" style={{ color: getContentValue("home_hero_card_subtitle_color", "#f3f4f6") }}>
                                {item.subtitle}
                              </p>
                            </CmsEditableRegion>
                          </div>
                          
                          <Link to="/products" onClick={preventPreviewNavigation} className="inline-block rounded-full bg-white text-gray-900 px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors duration-300 shadow-xl">
                            {getContentValue("home_hero_button_text", "Shop Now")}
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", `hero_title_${index + 1}`)} className="hidden md:inline-block w-fit pointer-events-auto">
                        <h2 className="text-2xl lg:text-3xl font-playfair font-bold tracking-widest whitespace-nowrap -rotate-90 origin-center mix-blend-overlay shadow-sm" style={{ color: getContentValue("home_hero_card_title_color", "rgba(255,255,255,0.9)") }}>
                          {item.title}
                        </h2>
                      </CmsEditableRegion>
                      
                      <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", `hero_title_${index + 1}`)} className="md:hidden absolute bottom-6 left-6 inline-block w-fit pointer-events-auto">
                        <h2 className="text-xl font-playfair font-bold tracking-wide drop-shadow-md" style={{ color: getContentValue("home_hero_card_title_color", "#ffffff") }}>
                          {item.title}
                        </h2>
                      </CmsEditableRegion>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. BEST SELLING FLOWERS */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 mb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_featured_products_title")} className="inline-block w-fit max-w-full">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900">
              {getContentValue("home_featured_products_title", "Best Selling Flowers")}
            </h2>
          </CmsEditableRegion>
        </div>

        <div className="flex flex-wrap justify-center gap-8 py-12">
          {[...visibleProducts, ...visiblePremades].slice(0, 8).map((item) => (
            <div key={`${item.id}-${item.name || item.product_name}`} className="group cursor-pointer w-full sm:w-[48%] md:w-[30%] lg:w-[22%] max-w-[320px]">
              <div className="bg-white p-4 rounded-[2rem] hover:shadow-xl transition-all duration-500 border border-gray-100">
                <div className="rounded-[1.5rem] relative bg-gray-100 overflow-hidden">
                  <img src={item.image ? `http://localhost:8000${item.image}` : "https://via.placeholder.com/300"} alt={item.name || item.product_name} className="h-[240px] w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 border border-white tracking-widest uppercase">Best Seller</div>
                </div>
                <div className="mt-5 px-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 font-playfair leading-tight">{item.name || item.product_name}</h3>
                  <p className="text-lg font-semibold text-[#4f6fa5] mt-1 mb-4">₱{item.price}</p>
                  <Link to="/products" onClick={preventPreviewNavigation} className="block w-full text-center bg-gray-900 text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300">
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/products" onClick={preventPreviewNavigation} className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full text-sm font-semibold uppercase tracking-wide border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300">
            See More Collections
          </Link>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_schedule_title")} className="inline-block w-fit max-w-full mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-16 text-center">
              {getContentValue("home_schedule_title", "Upcoming Events")}
            </h2>
          </CmsEditableRegion>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:px-12">
            {visibleSchedules.slice(0, 3).map((schedule) => (
              <motion.div key={schedule.id} whileHover={{ y: -6 }} className="group relative rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <div className="relative w-full h-[420px] rounded-[2rem] overflow-hidden">
                  <img src={schedule.image ? `http://localhost:8000${schedule.image}` : "https://via.placeholder.com/600x300"} alt={schedule.schedule_name} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 group-hover:opacity-100 transition duration-500"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-playfair font-bold mb-2 leading-tight drop-shadow-lg">{schedule.schedule_name}</h3>
                    <p className="text-sm md:text-base text-white font-medium mb-4 leading-relaxed drop-shadow">{schedule.description || `Join us for an exclusive floral showcase and arrangement session highlighting the ${schedule.schedule_name} collection.`}</p>
                    <Link to="/schedule" onClick={preventPreviewNavigation} className="inline-block bg-white text-gray-900 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300">
                      See Schedule
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECOMMENDED FOR YOU */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 mt-32 mb-20">
        <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", "home_categories_title")} className="inline-block w-fit max-w-full">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-12">
            {getContentValue("home_categories_title", "Recommended for You")}
          </h2>
        </CmsEditableRegion>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[700px]">
          {categoryCards.map((card) => (
            <div key={card.imageField} className={card.layoutClass}>
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", card.imageField)} className="absolute inset-0 z-10 rounded-[inherit]">
                <img src={getCmsAssetUrl(getContentValue(card.imageField, card.imageFallback))} className={card.imageClass} />
              </CmsEditableRegion>
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className={`absolute z-30 pointer-events-none flex flex-col ${card.contentClass}`}>
                {card.badge && (
                  <span className={`${card.badge === "Trending" ? "bg-[#4f6fa5]/90 text-white px-3" : "bg-white/90 text-gray-900 px-4"} w-fit text-xs font-bold py-1.5 rounded-full uppercase tracking-wider mb-3 block backdrop-blur-sm shadow-sm`}>
                    {card.badge}
                  </span>
                )}
                <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("home", card.titleField)} className="relative z-40 w-fit inline-block max-w-full pointer-events-auto">
                  <h3 className={card.titleClass}>
                    {getContentValue(card.titleField, card.titleFallback)}
                  </h3>
                </CmsEditableRegion>
                {card.showHoverText && (
                  <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-white border-b border-white pb-1 font-semibold">Shop to discover</span>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
