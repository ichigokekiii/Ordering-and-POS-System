/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { useContents } from "../../contexts/ContentContext";
import { motion, AnimatePresence } from "framer-motion";

function LandingPage() {
  const contentContext = useContents();
  const contents = contentContext?.contents || [];

  const [landing, setLanding] = useState(null);
  const [products, setProducts] = useState([]);
  const [premades, setPremades] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const getContentValue = (identifier, fallback = "") => {
    const item = contents.find(
      (c) =>
        c.identifier === identifier &&
        c.page === "home" &&
        !c.isArchived
    );

    if (!item) {
      return fallback;
    }

    if (item.type === "text") return item.content_text;
    if (item.type === "image") return item.content_image;

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

  // Generate hero items based on CMS contents.
  const bannerItems = contents
    .filter(c => c.page === "home" && c.identifier.includes("hero_image") && !c.isArchived && c.content_image)
    .sort((a, b) => a.identifier.localeCompare(b.identifier));

  const heroData = bannerItems.length >= 1 ? bannerItems.map((b, i) => ({
    id: i,
    image: `http://localhost:8000${b.content_image}`,
    title: getContentValue(`hero_title_${i + 1}`, landing.title),
    subtitle: getContentValue(`hero_subtitle_${i + 1}`, landing.subtitle),
  })) : [
    { id: 0, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200", title: "Carnations", subtitle: "Handcrafted and meticulously curated to convey your deepest sentiments." },
    { id: 1, image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200", title: "Sunflowers", subtitle: "Bright, vibrant, and bursting with joy. Perfect for lighting up any room." },
    { id: 2, image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200", title: "Roses", subtitle: "Timeless elegance and classic beauty for every romantic occasion." },
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

  return (
    <div className="bg-[#fcfaf9] text-gray-900 min-h-screen pt-20 pb-12 overflow-x-hidden font-sans">
      
      {/* 1. HERO COMPONENT (Expanding Bento Cards) */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 mb-32 -mt-4">
        {/* Top Text Block */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-10 items-start mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-sm mb-4">
              Floral Discovery
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold leading-[1.15] text-gray-900 tracking-tight">
              Discover the perfect <br />
              <span className="font-dancing text-[#4f6fa5] font-normal leading-[0.85] block mt-1 ml-2 lg:ml-4 transform -rotate-2 text-6xl md:text-8xl lg:text-9xl">
                Flowers
              </span>
              <span className="inline-block mt-2">just for you</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
            className="hidden lg:flex min-h-[360px] items-center justify-end"
          >
            <div className="max-w-[320px] pr-2">
              <p className="text-base md:text-lg leading-relaxed text-gray-600 font-light">
                Thoughtfully curated floral arrangements designed to bring softness, beauty, and meaning to every occasion.
              </p>

              {/* MODIFIED PREMIUM "COLOR WIPE" CTA BUTTON WITH SLIDING TEXT */}
              <div className="mt-8">
                <Link
                  to="/products"
                  className="group relative flex h-14 w-[200px] items-center rounded-full bg-gray-900 p-1 shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  {/* Base layer: White Text (Visible when button is dark) */}
                  {/* Positioned exactly matching the expanding inner layer */}
                  <div className="pointer-events-none absolute left-1 top-1 flex h-12 w-[192px] items-center justify-center pl-6 transition-transform duration-[600ms] ease-[cubic-bezier(0.5,1,0.89,1)] group-hover:-translate-x-4">
                    <span className="text-sm font-semibold tracking-wide text-white">Shop Now</span>
                  </div>

                  {/* Expanding layer: White Background sliding from left to right */}
                  {/* Starts as a circle (w-12 h-12) on the left, expands to full width */}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-end overflow-hidden rounded-full bg-white transition-all duration-[600ms] ease-[cubic-bezier(0.5,1,0.89,1)] group-hover:w-full">
                    
                    {/* Top layer: Black Text (Revealed as the white div expands over it) */}
                    {/* Absolute to the expanding div, so it stays pinned while the mask grows */}
                    <div className="pointer-events-none absolute left-0 top-0 flex h-12 w-[192px] items-center justify-center pl-6 transition-transform duration-[600ms] ease-[cubic-bezier(0.5,1,0.89,1)] group-hover:-translate-x-4">
                      <span className="text-sm font-semibold tracking-wide text-gray-900">Shop Now</span>
                    </div>

                    {/* Arrow Icon - Pushed to the right edge of the expanding div */}
                    <div className="relative z-20 flex h-12 w-12 shrink-0 items-center justify-center text-gray-900">
                      <svg 
                        className="h-5 w-5 transition-transform duration-[600ms] ease-out group-hover:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={2}
                      >
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
                // We use flex grow transitions. Ease out cubic for a natural settle.
                className={`group relative rounded-[2rem] md:rounded-[3rem] overflow-hidden cursor-pointer transition-[flex,transform,filter] duration-[800ms] ease-out flex flex-col justify-end 
                  ${isActive ? "flex-[4_4_0%] md:flex-[3_3_0%] hover:shadow-2xl" : "flex-[1_1_0%] brightness-75 hover:brightness-100"}`}
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                
                {/* Dark gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-700 ease-out ${isActive ? 'opacity-100' : 'opacity-60'}`}></div>

                {/* Text Content */}
                <div className={`relative z-10 w-full text-white p-6 md:p-10 flex flex-col justify-end h-full`}>
                  {/* Stable container width prevents text reflow during flex-grow */}
                  <div className={`w-[80vw] md:w-[40vw] transition-opacity duration-700 ease-out ${isActive ? 'opacity-100 delay-100' : 'opacity-0 md:opacity-100'} ${!isActive && 'md:hidden'}`}>
                     <AnimatePresence mode="popLayout">
                       {isActive && (
                         <motion.div
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                           transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                         >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-4 drop-shadow-lg leading-tight">
                              {item.title}
                            </h2>
                            <p className="text-gray-100 text-sm md:text-lg lg:text-xl md:w-3/4 leading-relaxed font-light drop-shadow mb-8">
                              {item.subtitle}
                            </p>
                            <Link to="/products" className="inline-block rounded-full bg-white text-gray-900 px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-[#4f6fa5] hover:text-white transition-colors duration-300 shadow-xl">
                              Explore Collection
                            </Link>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                  
                  {/* Vertical / Compressed View text when inactive */}
                  {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       {/* Desktop vertical label */}
                       <h2 className="hidden md:block text-2xl lg:text-3xl font-playfair font-bold tracking-widest text-white/90 whitespace-nowrap -rotate-90 origin-center mix-blend-overlay shadow-sm">
                         {item.title}
                       </h2>
                       {/* Mobile small label at bottom */}
                       <h2 className="md:hidden absolute bottom-6 left-6 text-xl font-playfair font-bold tracking-wide text-white drop-shadow-md">
                         {item.title}
                       </h2>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. BEST SELLING FLOWERS (Grid Layout) */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 mb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900">
            Best Selling Flowers
          </h2>
        </div>

        {/* GRID (4 per row, 8 items, flex-wrap, centered rows) */}
        <div className="flex flex-wrap justify-center gap-8 py-12">
          {[...products, ...premades].slice(0, 8).map((item) => (
            <div key={`${item.id}-${item.name || item.product_name}`} className="group cursor-pointer w-full sm:w-[48%] md:w-[30%] lg:w-[22%] max-w-[320px]">
              
              <div className="bg-white p-4 rounded-[2rem] hover:shadow-xl transition-all duration-500 border border-gray-100">
                
                {/* Image */}
                <div className="rounded-[1.5rem] relative bg-gray-100 overflow-hidden">
                  <img
                    src={item.image ? `http://localhost:8000${item.image}` : "https://via.placeholder.com/300"}
                    alt={item.name || item.product_name}
                    className="h-[240px] w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 border border-white tracking-widest uppercase">
                    Best Seller
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 px-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 font-playfair leading-tight">
                    {item.name || item.product_name}
                  </h3>

                  <p className="text-lg font-semibold text-[#4f6fa5] mt-1 mb-4">
                    ₱{item.price}
                  </p>

                  <Link
                    to="/products"
                    className="block w-full text-center bg-gray-900 text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300"
                  >
                    Order Now
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full text-sm font-semibold uppercase tracking-wide border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300"
          >
            See More Collections
          </Link>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS (Schedule component) */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
           <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-16 text-center">
              Upcoming Events
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:px-12">
              {schedules.slice(0,3).map(schedule => (
                 <motion.div 
                   key={schedule.id}
                   whileHover={{ y: -6 }}
                   className="group relative rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100"
                 >
                   <div className="relative w-full h-[420px] rounded-[2rem] overflow-hidden">
                     <img 
                       src={schedule.image ? `http://localhost:8000${schedule.image}` : "https://via.placeholder.com/600x300"} 
                       alt={schedule.schedule_name} 
                       className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                     />

                     {/* Featured Badge (keep current style) */}
                     <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                       Featured
                     </div>

                     {/* Base dark overlay for readability */}
                     <div className="absolute inset-0 bg-black/20"></div>
                     {/* Strong bottom-weighted gradient for readability */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 group-hover:opacity-100 transition duration-500"></div>

                     {/* Content */}
                     <div className="absolute bottom-6 left-6 right-6 text-white">
                       <h3 className="text-2xl md:text-3xl font-playfair font-bold mb-2 leading-tight drop-shadow-lg">
                         {schedule.schedule_name}
                       </h3>

                       <p className="text-sm md:text-base text-white font-medium mb-4 leading-relaxed drop-shadow">
                         {schedule.description || `Join us for an exclusive floral showcase and arrangement session highlighting the ${schedule.schedule_name} collection.`}
                       </p>

                       <Link
                         to="/schedule"
                         className="inline-block bg-white text-gray-900 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300"
                       >
                         See Schedule
                       </Link>
                     </div>
                   </div>
                 </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. RECOMMENDED FOR YOU (Bento Box Categories) */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 mt-32 mb-20">
         <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-12">
            Recommended for You
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[700px]">
           
           {/* large card 1: col-span-2 row-span-2 */}
           <div className="group relative col-span-1 md:col-span-2 md:row-span-2 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800" className="w-full h-[350px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                <span className="bg-white/90 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block backdrop-blur-sm shadow-sm">Collection</span>
                <h3 className="text-white text-4xl md:text-5xl font-playfair font-bold pr-8">Carnation Arrangements</h3>
                <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white border-b border-white pb-1 font-semibold">Shop to discover</span>
                </motion.div>
              </div>
           </div>

           {/* medium card 1: col-span-2 row-span-1 */}
           <div className="group relative col-span-1 md:col-span-2 md:row-span-1 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
              <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800" className="w-full h-[250px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent bg-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                <span className="bg-[#4f6fa5]/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block backdrop-blur-sm shadow-md">Trending</span>
                <h3 className="text-white text-2xl md:text-3xl font-playfair font-bold">Sunflowers Drops</h3>
              </div>
           </div>

           {/* small card 1 */}
           <div className="group relative col-span-1 md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
              <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800" className="w-full h-[250px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent bg-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                <h3 className="text-white text-xl md:text-2xl font-playfair font-bold leading-tight">Classic<br/>Roses</h3>
              </div>
           </div>

           {/* small card 2 */}
           <div className="group relative col-span-1 md:col-span-1 md:row-span-1 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer bg-[#eaf2ff]">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" className="w-full h-[250px] md:h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 mix-blend-multiply opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a4475]/90 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                 <h3 className="text-white text-xl md:text-2xl font-playfair font-bold leading-tight">Vibrant<br/>Gerberas</h3>
              </div>
           </div>
         </div>

      </section>
    </div>
  );
}

export default LandingPage;