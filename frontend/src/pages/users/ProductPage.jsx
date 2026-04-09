/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useProducts } from "../../contexts/ProductContext";
import { useContents } from "../../contexts/ContentContext";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../../cms/cmsRegistry";

function ProductPage({ cmsPreview }) {
  const { premades, loading } = useProducts();
  const { contents } = useContents();
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

    // fallback if category field is missing
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

  return (
    <div className="bg-[#fcfaf9] text-gray-900 min-h-screen font-sans pb-24">
      
      {/* 1. HERO HEADER (UPDATED WITH BLURRED IMAGE) */}
      <section className="relative isolate overflow-hidden border-b border-gray-100 pt-20 pb-16">
        <CmsEditableRegion
          cmsPreview={cmsPreview}
          field={getCmsField("products", "products_hero_image")}
          className="absolute inset-0"
          overlayClassName="rounded-none"
        >
          <div className="absolute inset-0">
             {/* The image itself is blurred and scaled up slightly to prevent white edges */}
            <img
              src={heroImage}
              alt="Showcase hero background"
              className="h-full w-full object-cover blur-sm scale-105"
            />
             {/* A gradient overlay helps text readability while letting the color bleed through */}
            <div className="absolute inset-0 bg-white/70" />
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
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-gray-900 leading-[1.05] drop-shadow-sm">
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
              <p className="text-gray-800 font-medium leading-relaxed text-base md:text-lg drop-shadow-sm">
                {getContentValue("products_hero_description", "Discover our carefully curated selection of fresh, sustainably sourced floral arrangements designed for you!")}
              </p>
            </CmsEditableRegion>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12 mb-8">
        
        {/* 2. SEARCH & FILTER UTILITY */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           
           {/* Categories Pills */}
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

           {/* Search Bar */}
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
             <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
             </div>
           </div>
        </div>

        {/* 3. BENTO GRID LAYOUT (GlowNest Style) */}
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
                      className="group border-r border-b border-gray-200 relative bg-white hover:shadow-md transition-all duration-300 flex flex-col h-[500px]"
                    >
                      {/* Image Container */}
                      <div className="flex-grow w-full overflow-hidden flex items-center justify-center p-8">
                         <img 
                           src={product.image ? `http://localhost:8000${product.image}` : "https://via.placeholder.com/300"} 
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
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="text-gray-400 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentPage === i + 1
                      ? "bg-gray-800 scale-125"
                      : "bg-gray-300 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="text-gray-400 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
      
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