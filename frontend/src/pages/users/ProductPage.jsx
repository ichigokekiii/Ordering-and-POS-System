/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for routing
import { useProducts } from "../../contexts/ProductContext";
import { useContents } from "../../contexts/ContentContext";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../../cms/cmsRegistry";
import { getAssetUrl } from "../../utils/assetUrl";

function ProductPage({ cmsPreview }) {
  const { premades, loading } = useProducts();
  const { contents } = useContents();
  const navigate = useNavigate(); // Initialize navigate

  // State for the new Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  const asBoolean = (value) => value === 1 || value === true || value === "1";
  const getContentValue = (key, defaultValue) =>
    getCmsContentValue(contents, "products", key, defaultValue);
  const heroImage = getCmsAssetUrl(
    getContentValue(
      "products_hero_image",
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=1600"
    )
  );

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ["All", "Roses", "Lilies", "Tulips", "Carnation", "Mixed"];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfaf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f6fa5]"></div>
      </div>
    );
  }

  // Filter logic
  const filteredProducts = premades.filter(product => {
    if (asBoolean(product.isArchived)) return false;

    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      (product.category && product.category.toLowerCase() === activeCategory.toLowerCase());

    const finalMatchesCategory = matchesCategory ||
      (product.type && product.type.toLowerCase() === activeCategory.toLowerCase());

    return matchesSearch && finalMatchesCategory;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Modal Handlers
  const handleCloseModal = () => setSelectedProduct(null);
  const handlePreOrder = () => {
    // Optionally pass the selected product in state if you want the schedule page to know what they clicked
    navigate("/schedule");
  };

  return (
    <div className="bg-[#fcfaf9] text-gray-900 min-h-screen font-sans pb-24">
      
      {/* 1. HERO HEADER */}
      <section className="relative isolate overflow-hidden border-b border-gray-100 pt-20 pb-16">
        <CmsEditableRegion
          cmsPreview={cmsPreview}
          field={getCmsField("products", "products_hero_image")}
          className="absolute inset-0"
          overlayClassName="rounded-none"
        >
          <div className="absolute inset-0">
             <img
               src={heroImage}
               alt="Showcase hero background"
               className="h-full w-full object-cover blur-[1px] scale-[1.02]"
             />
            <div className="absolute inset-0 bg-white/25" />
          </div>
        </CmsEditableRegion>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="max-w-3xl py-8 md:py-10"
          >
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("products", "products_hero_label")} className="inline-block w-fit pointer-events-auto">
              <p className="text-[#4f6fa5] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 drop-shadow-sm">
                {getContentValue("products_hero_label", "The Collection")}
              </p>
            </CmsEditableRegion>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-[#111827] leading-[1.05] drop-shadow-sm">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("products", "products_hero_title_intro")} className="inline-block w-fit pointer-events-auto">
                <span>{getContentValue("products_hero_title_intro", "Blooms for")}</span>
              </CmsEditableRegion>
              <br />
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("products", "products_hero_title_accent")} className="inline-block w-fit pointer-events-auto">
                <span className="block font-dancing text-[#4f6fa5] font-normal text-6xl md:text-8xl lg:text-9xl leading-[0.9] mt-3 lg:ml-2 transform -rotate-2">
                  {getContentValue("products_hero_title_accent", "Every Moment")}
                </span>
              </CmsEditableRegion>
            </h1>
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("products", "products_hero_description")} className="mt-8 inline-block max-w-lg pointer-events-auto">
              <p className="text-[#1f2937] font-medium leading-relaxed text-base md:text-lg drop-shadow-sm">
                {getContentValue("products_hero_description", "Discover our carefully curated selection of fresh, sustainably sourced floral arrangements designed for you!")}
              </p>
            </CmsEditableRegion>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12 mb-8">
        
        {/* 2. SEARCH & FILTER UTILITY */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 w-full md:w-auto">
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                 className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${activeCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'}`}
               >
                 {cat}
               </button>
             ))}
           </div>

           <div className="relative w-full md:w-80 group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#4f6fa5] transition-colors" />
             </div>
             <input 
               type="text"
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               placeholder="Search collection..."
               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6fa5]/20 focus:border-[#4f6fa5] transition-all shadow-sm"
             />
           </div>
        </div>

        {/* 3. BENTO GRID LAYOUT */}
        <motion.div layout className="bg-white border-t border-l border-gray-200">
           {paginatedProducts.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((product) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)} // Added onClick to open Modal
                      className="group border-r border-b border-gray-200 relative bg-white hover:shadow-md transition-all duration-300 flex flex-col h-[500px] cursor-pointer"
                    >
                      {/* Image Container */}
                      <div className="flex-grow w-full overflow-hidden flex items-center justify-center p-8">
                         <img 
                           src={product.image ? getAssetUrl(product.image) : "https://via.placeholder.com/300"} 
                           alt={product.name}
                           className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                         />
                      </div>

                      {/* Content Block */}
                      <div className="p-8 text-center bg-white transition-all duration-300 group-hover:-translate-y-1">
                         <h3 className="text-xl font-playfair font-bold text-gray-900 mb-2 truncate">
                           {product.name}
                         </h3>
                         <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">
                           {product.description?.substring(0, 20) || 'Floral Arrangement'}
                         </p>
                         <p className="text-lg font-bold text-[#4f6fa5]">
                           ₱{product.price}
                         </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
           ) : (
             <div className="py-32 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-playfair">
                  {filteredProducts.length === 0 && (searchTerm || activeCategory !== "All")
                    ? "No products found matching your search."
                    : "No products available."}
                </p>
                <button
                  onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                  className="mt-4 text-[#4f6fa5] font-semibold hover:underline"
                >
                  Clear Filters
                </button>
             </div>
           )}
        </motion.div>

        {/* 4. PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-16 gap-6">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="text-gray-400 hover:text-gray-900 disabled:opacity-30">
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${currentPage === i + 1 ? "bg-gray-800 scale-125" : "bg-gray-300 hover:bg-gray-500"}`}
                />
              ))}
            </div>

            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="text-gray-400 hover:text-gray-900 disabled:opacity-30">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* 5. PRODUCT SHOWCASE MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 lg:p-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} 
              // Set a fixed height on the modal so the internal scroll works perfectly
              className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[75vh]"
            >
              {/* Close Button - Kept absolute so it hovers over everything */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 hover:bg-gray-100 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 transition-colors border border-gray-100 shadow-sm"
              >
                <span className="text-xl leading-none">✕</span>
              </button>

              {/* LEFT SIDE: Premium Image Presentation (45% width) */}
              <div className="md:w-[45%] relative bg-[#fcfaf9] flex items-center justify-center min-h-[300px] shrink-0">
                {/* Subtle top gradient for a "studio lighting" effect */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#4f6fa5]/10 to-transparent"></div>
                <img
                  src={selectedProduct.image ? getAssetUrl(selectedProduct.image) : "https://via.placeholder.com/500"}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-8 md:p-12 drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* RIGHT SIDE: Layout with Sticky Header, Scrollable Middle, Sticky Footer (55% width) */}
              <div className="md:w-[55%] flex flex-col bg-white h-full">
                
                {/* Sticky Header: Category, Title, Price */}
                <div className="px-8 pt-10 pb-6 md:px-12 md:pt-14 md:pb-6 shrink-0 border-b border-gray-100">
                  <span className="inline-block px-3 py-1 bg-[#4f6fa5]/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-4">
                    {selectedProduct.category || selectedProduct.type || "Floral Collection"}
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mb-3 leading-tight pr-8">
                    {selectedProduct.name}
                  </h2>
                  
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{selectedProduct.price}
                  </p>
                </div>

                {/* Scrollable Middle: Description Area */}
                <div className="px-8 py-6 md:px-12 md:py-8 overflow-y-auto nice-scrollbar grow">
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                    {selectedProduct.description || "A beautiful, carefully curated floral arrangement designed to bring a touch of elegance to any special moment.\n\nSustainably sourced and hand-crafted by our expert florists, this piece features premium blooms selected for their longevity and vibrant colors. Perfect as a gift or a centerpiece for your next gathering.\n\nPlease note: Due to seasonal availability, some filler flowers may be substituted with equally beautiful alternatives."}
                  </p>

                  {/* Optional: Add more details here if your DB supports it, like dimensions, care instructions, etc. */}
                </div>

                {/* Sticky Footer: CTA Button */}
                <div className="px-8 py-6 md:px-12 md:py-8 shrink-0 bg-gray-50/50 border-t border-gray-100">
                  <button
                    onClick={handlePreOrder}
                    className="w-full bg-gray-900 text-white rounded-full py-4 md:py-5 text-xs font-bold tracking-widest uppercase hover:bg-[#4f6fa5] hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    Pre-Order Now
                  </button>
                  <p className="text-center mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Available exclusively at during our pop-up events
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Helper CSS */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default ProductPage;
