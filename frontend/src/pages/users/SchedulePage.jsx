/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSchedules } from "../../contexts/ScheduleContext";
import api from "../../services/api";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SchedulePage() {
  const { schedules, loading } = useSchedules();

  const navigate = useNavigate();
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Pop-Ups", "Workshops", "Online Seminars"];

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const schedulesPerPage = 9; // Grid of 3x3

  // Booking feedback state
  const [bookingStatus, setBookingStatus] = useState(null); 
  const [bookingMessage, setBookingMessage] = useState("");

  // Order temporary notification state
  const [orderStatus, setOrderStatus] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  // Smooth fade-out logic
  useEffect(() => {
    if (bookingStatus || orderStatus) {
      setShowNotification(true);

      const fadeTimer = setTimeout(() => {
        setShowNotification(false); // start fade
      }, 4500);

      const removeTimer = setTimeout(() => {
        setBookingStatus(null);
        setBookingMessage("");
        setOrderStatus(null);
        setOrderMessage("");
      }, 5000); 

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [bookingStatus, orderStatus]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfaf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f6fa5]"></div>
      </div>
    );
  }

  // Only show available schedules
  const availableSchedules = schedules.filter((s) => s.isAvailable === 1 || s.isAvailable === true);

  // Filter logic
  const filteredSchedules = availableSchedules.filter(schedule => {
    const matchesSearch = schedule.schedule_name?.toLowerCase().includes(searchTerm.toLowerCase());
    // Basic mock category logic (since real db table may be purely title based)
    const matchesCategory = activeCategory === "All" || 
                            schedule.schedule_name?.toLowerCase().includes(activeCategory.toLowerCase()) || 
                            schedule.schedule_description?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage) || 1;
  const indexOfLast = currentPage * schedulesPerPage;
  const indexOfFirst = indexOfLast - schedulesPerPage;
  const currentSchedules = filteredSchedules.slice(indexOfFirst, indexOfLast);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleOpenModal = (schedule) => setSelectedSchedule(schedule);
  const handleCloseModal = () => {
    setSelectedSchedule(null);
    setIsBooking(false);
    setBookingEmail("");
  };

  const handleOrderNow = () => {
    if (!selectedSchedule) return;
    navigate("/order", { state: { schedule: selectedSchedule } });
    handleCloseModal();
  };

  const handleBookClick = () => setIsBooking(true);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/schedules/${selectedSchedule.id}/book`, { email: bookingEmail });
      setBookingStatus("success");
      setBookingMessage(res.data.message);
      setBookingEmail("");
      setIsBooking(false);
    } catch (error) {
      if (error.response && error.response.data?.message) {
        setBookingStatus("error");
        setBookingMessage(error.response.data.message);
      } else {
        setBookingStatus("error");
        setBookingMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="bg-[#fcfaf9] text-gray-900 min-h-screen font-sans pb-24">
      
       {/* 1. HERO HEADER */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="max-w-2xl"
          >
            <p className="text-[#4f6fa5] font-semibold tracking-widest uppercase text-xs md:text-sm mb-4">Pop-up Experience</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-gray-900 leading-[1.05]">
              Experience the
              <br />
              <span className="block font-dancing text-[#4f6fa5] font-normal text-6xl md:text-8xl lg:text-9xl leading-[0.9] mt-3 lg:ml-2 transform -rotate-2">
                Blossom
              </span>
            </h1>
            <p className="mt-8 text-gray-500 leading-relaxed text-base md:text-lg max-w-lg">
              Check out our latest pop-up schedules and live events. Find an experience near you and reserve your spot!
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER UTILITY */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12 mb-8">
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
               placeholder="Search events..."
               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6fa5]/20 focus:border-[#4f6fa5] transition-all shadow-sm"
             />
             <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
             </div>
           </div>
        </div>

        {/* 3. EVENTBUX INSPIRED CARDS */}
        {currentSchedules.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             <AnimatePresence mode="popLayout">
               {currentSchedules.map((schedule) => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.4 }}
                   key={schedule.id} 
                   onClick={() => handleOpenModal(schedule)}
                   className="group bg-white rounded-[2rem] transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-1 relative flex flex-col"
                 >
                   {/* Top Image Box */}
                   <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                     {schedule.image ? (
                       <img
                         src={`${import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:8000"}${schedule.image}`}
                         alt={schedule.schedule_name}
                         className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Image Placeholder</div>
                     )}
                     

                     {/* Action Icons */}
                     <div className="absolute top-4 right-4 flex gap-2">
                        <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-[#4f6fa5] hover:scale-110 transition-all shadow-sm focus:outline-none" onClick={(e) => { e.stopPropagation(); }}>
                           <Share className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   </div>

                   {/* Bottom Details Box */}
                   <div className="p-6 md:p-8 flex flex-row items-center gap-6">
                      {/* Left: Date Block */}
                      {(() => {
                         const date = new Date(schedule.event_date);
                         const isInvalid = isNaN(date.getTime());
                         const month = isInvalid ? "TBA" : date.toLocaleString('default', { month: 'short' }).toUpperCase();
                         const day = isInvalid ? "--" : date.getDate();
                         return (
                           <div className="flex flex-col items-center justify-center min-w-[50px]">
                             <span className="text-[10px] font-bold text-[#4f6fa5] tracking-widest leading-none mb-1">{month}</span>
                             <span className="text-3xl font-bold text-gray-900 leading-none">{day}</span>
                           </div>
                         )
                      })()}
                      
                      {/* Right: Info */}
                      <div className="border-l-2 border-gray-100 pl-6 flex flex-col justify-center w-full">
                         <h3 className="font-playfair font-bold text-xl text-gray-900 leading-tight mb-2 group-hover:text-[#4f6fa5] transition-colors truncate">
                           {schedule.schedule_name}
                         </h3>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">
                           {schedule.location || "Location TBA"}
                         </p>
                      </div>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center text-gray-500">
             <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
             <p className="text-lg font-playfair">No upcoming events found.</p>
             <button onClick={() => {setSearchTerm(""); setActiveCategory("All");}} className="mt-4 text-[#4f6fa5] font-semibold hover:underline">Clear Filters</button>
          </div>
        )}

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
                    currentPage === i + 1 ? "bg-gray-800 scale-125" : "bg-gray-300 hover:bg-gray-500"
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

      {/* MODAL */}
      <AnimatePresence>
        {selectedSchedule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl min-h-[450px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/20 hover:bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 transition-colors"
              >
                <span className="text-xl leading-none">✕</span>
              </button>

              {/* IMAGE SIDE */}
              <div className="md:w-1/2 bg-gray-100 overflow-hidden relative min-h-[250px] md:min-h-full">
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:8000"}${selectedSchedule.image}`}
                  alt={selectedSchedule.schedule_name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              {/* CONTENT SIDE */}
              <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {isBooking ? (
                    <motion.div
                      key="booking-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                      <button
                        onClick={() => setIsBooking(false)}
                        className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 mb-8 flex items-center gap-2 group transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                      </button>
                      
                      <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-6">Confirm Reservation</h2>
                      <p className="text-gray-500 mb-8 leading-relaxed">Please enter your email to secure your free reservation at {selectedSchedule.schedule_name}.</p>
                      
                      <form onSubmit={handleSubmitBooking} className="flex flex-col gap-4">
                        <input
                          type="email"
                          required
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full border-b-2 border-gray-200 py-3 text-lg focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
                        />

                        <button
                          type="submit"
                          className="w-full bg-gray-900 text-white rounded-full mt-6 py-4 font-bold tracking-widest uppercase text-xs hover:bg-[#4f6fa5] hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                          Confirm Free Booking
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="booking-info"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col h-full"
                    >
                      <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-gray-900 leading-tight mb-4">
                        {selectedSchedule.schedule_name}
                      </h2>

                      <p className="text-gray-500 leading-relaxed mb-8">
                        {selectedSchedule.schedule_description || "Join us for a special floral pop-up experience."}
                      </p>

                      <div className="space-y-4 text-sm text-gray-600 mb-10 pb-10 border-b border-gray-100">
                        <div className="flex gap-4">
                           <div className="w-12 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</div>
                           <div className="font-semibold text-gray-900">{new Date(selectedSchedule.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div className="flex gap-4">
                           <div className="w-12 text-xs font-bold text-gray-400 uppercase tracking-widest">Where</div>
                           <div className="font-semibold text-gray-900">{selectedSchedule.location || "Location coming soon"}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-auto">
                        <button
                          onClick={handleBookClick}
                          className="w-full bg-gray-900 text-white rounded-full py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#4f6fa5] hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                          Get Event Updates
                        </button>

                        <button
                          onClick={handleOrderNow}
                          className="w-full border border-gray-200 text-gray-900 rounded-full py-4 text-xs font-bold tracking-widest uppercase hover:border-gray-900 hover:bg-gray-50 transition-all hover:-translate-y-1"
                        >
                          Order Flowers for This Event
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
      
      {/* Toast Notification */}
      {bookingStatus && (
        <div className={`fixed top-6 right-6 z-[100] transition-opacity duration-500 ${showNotification ? "opacity-100" : "opacity-0"}`}>
          <div
            className={`min-w-[280px] max-w-sm rounded-[1.5rem] px-6 py-5 shadow-2xl border text-sm font-medium transition-all duration-300 ${
              bookingStatus === "success"
                ? "bg-white text-green-700 border-green-200"
                : "bg-white text-red-700 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{bookingMessage}</span>
              <button
                onClick={() => {
                  setBookingStatus(null);
                  setBookingMessage("");
                }}
                className="text-gray-400 hover:text-gray-900 text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order In-Progress Notification */}
      {orderStatus && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] transition-opacity duration-500 ${showNotification ? "opacity-100" : "opacity-0"}`}>
          <div className="min-w-[280px] max-w-sm rounded-[1.5rem] px-6 py-5 shadow-2xl border text-sm font-medium bg-gray-900 text-white border-gray-800">
            <div className="flex items-center justify-between gap-4">
              <span>{orderMessage}</span>
              <button
                onClick={() => {
                  setOrderStatus(null);
                  setOrderMessage("");
                }}
                className="text-white/50 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;
