/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSchedules } from "../../contexts/ScheduleContext";
import { useContents } from "../../contexts/ContentContext";
import api from "../../services/api";
import { Search, ChevronLeft, ChevronRight, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../contexts/CartContext";
import { useNavbar } from "../../contexts/NavbarContext";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import { EMAIL_MAX_LENGTH, validateEmail } from "../../utils/authValidation";
import { clearFieldError, normalizeApiValidationErrors, sanitizeSearchTerm } from "../../utils/formValidation";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../../cms/cmsRegistry";
import { getAssetUrl } from "../../utils/assetUrl";


function SchedulePage({ cmsPreview }) {
  const { schedules, loading } = useSchedules();
  const { contents } = useContents();
  const asBoolean = (value) => value === 1 || value === true || value === "1";
  const getContentValue = (key, defaultValue) =>
    getCmsContentValue(contents, "schedule", key, defaultValue);
  const heroImage = getCmsAssetUrl(
    getContentValue(
      "schedule_hero_image",
      "https://images.unsplash.com/photo-1468327768560-75b778cbb551?q=80&w=1600"
    )
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { selectSchedule } = useCart();
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingFieldErrors, setBookingFieldErrors] = useState({ email: "" });
  const { currentUser } = useNavbar();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Order Available");
  const categories = ["Order Available", "Happening Now", "Upcoming Events", "Coming Soon"];

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

  const normalizeDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = normalizeDate(eventDate);

    if (!event) return null;

    return (event - today) / (1000 * 60 * 60 * 24);
  };

  const isFutureSchedule = (schedule) => {
    const daysUntil = getDaysUntilEvent(schedule.event_date);
    return daysUntil !== null && daysUntil >= 0;
  };

  const isActiveSchedule = (schedule) =>
  !asBoolean(schedule.isArchived) && asBoolean(schedule.isAvailable);

const isInactiveSchedule = (schedule) =>
  !asBoolean(schedule.isArchived) && !asBoolean(schedule.isAvailable);

const isHappeningNowSchedule = (schedule) => {
  const daysUntil = getDaysUntilEvent(schedule.event_date);
  return !asBoolean(schedule.isArchived) && daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
};

const isUpcomingSchedule = (schedule) => {
  const daysUntil = getDaysUntilEvent(schedule.event_date);
  return !asBoolean(schedule.isArchived) && daysUntil !== null && daysUntil > 7;
};

  const isOrderable = (schedule) => {
  if (!schedule) return false;
  if (!isFutureSchedule(schedule)) return false;
  return !!schedule.is_orderable;
};

const getOrderLabel = (schedule) => {
  if (!schedule) return "Select An Event";
  
  if (isOrderable(schedule)) {
    return "Order Flowers for This Event";
  }
  
  return "Orders Not Yet Open"; 
};

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

  useEffect(() => {
    if (location.state?.orderNotice) {
      setOrderStatus(location.state.orderNoticeType || "error");
      setOrderMessage(location.state.orderNotice);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfaf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f6fa5]"></div>
      </div>
    );
  }

  const visibleSchedules = schedules.filter(
  (schedule) => !asBoolean(schedule.isArchived)
);

  // Filter logic
  const filteredSchedules = visibleSchedules.filter((schedule) => {
    const matchesSearch = schedule.schedule_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
  (activeCategory === "Happening Now" && isHappeningNowSchedule(schedule)) ||
  (activeCategory === "Upcoming Events" && isUpcomingSchedule(schedule)) ||
  (activeCategory === "Coming Soon" && isInactiveSchedule(schedule)) ||
  (activeCategory === "Order Available" && isActiveSchedule(schedule) && isOrderable(schedule));

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
    setBookingFieldErrors({ email: "" });
  };

  const handleOrderNow = () => {
  if (!selectedSchedule) return;

  if (!currentUser) {
    navigate("/login", { state: { from: "/schedule" } });
    return;
  }

  selectSchedule(selectedSchedule.id);
  navigate("/order", { state: { schedule: selectedSchedule } });
  handleCloseModal();
};

  const handleBookClick = () => setIsBooking(true);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    const nextFieldErrors = {
      email: validateEmail(bookingEmail),
    };

    setBookingFieldErrors(nextFieldErrors);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      return;
    }

    try {
      const res = await api.post(`/schedules/${selectedSchedule.id}/book`, { email: bookingEmail });
      setBookingStatus("success");
      setBookingMessage(res.data.message);
      setBookingEmail("");
      setBookingFieldErrors({ email: "" });
      setIsBooking(false);
    } catch (error) {
      const normalizedError = normalizeApiValidationErrors(error);
      setBookingFieldErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
      setBookingStatus("error");
      setBookingMessage(normalizedError.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#fcfaf9] text-gray-900 min-h-screen font-sans pb-24">
      
       {/* 1. HERO HEADER */}
      <section className="relative isolate overflow-hidden border-b border-gray-100 pt-20 pb-16">
        <CmsEditableRegion
          cmsPreview={cmsPreview}
          field={getCmsField("schedule", "schedule_hero_image")}
          className="absolute inset-0"
          overlayClassName="rounded-none"
        >
          <div className="absolute inset-0">
            {/* Keep the image softly blurred without washing out its colors */}
            <img
              src={heroImage}
              alt="Schedule hero background"
              className="h-full w-full object-cover blur-[1px] scale-[1.02]"
            />
            {/* A light veil keeps text readable without turning the image white */}
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
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("schedule", "schedule_hero_label")} className="inline-block w-fit pointer-events-auto">
              <p className="text-[#4f6fa5] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 drop-shadow-sm">
                {getContentValue("schedule_hero_label", "Pop-up Experience")}
              </p>
            </CmsEditableRegion>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-[#111827] leading-[1.05] drop-shadow-sm">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("schedule", "schedule_hero_title_intro")} className="inline-block w-fit pointer-events-auto">
                <span>{getContentValue("schedule_hero_title_intro", "Experience the")}</span>
              </CmsEditableRegion>
              <br />
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("schedule", "schedule_hero_title_accent")} className="inline-block w-fit pointer-events-auto">
                <span className="block font-dancing text-[#4f6fa5] font-normal text-6xl md:text-8xl lg:text-9xl leading-[0.9] mt-3 lg:ml-2 transform -rotate-2">
                  {getContentValue("schedule_hero_title_accent", "Blossom")}
                </span>
              </CmsEditableRegion>
            </h1>
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("schedule", "schedule_hero_description")} className="mt-8 inline-block max-w-lg pointer-events-auto">
              <p className="text-[#1f2937] font-medium leading-relaxed text-base md:text-lg drop-shadow-sm">
                {getContentValue("schedule_hero_description", "Check out our latest pop-up schedules and live events. Find an experience near you and reserve your spot!")}
              </p>
            </CmsEditableRegion>
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
               onChange={(e) => { setSearchTerm(sanitizeSearchTerm(e.target.value)); setCurrentPage(1); }}
               placeholder="Search events..."
               maxLength={100}
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
                         src={getAssetUrl(schedule.image)}
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
             <button onClick={() => {setSearchTerm(""); setActiveCategory("Order Available");}} className="mt-4 text-[#4f6fa5] font-semibold hover:underline">Clear Filters</button>
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
                  src={getAssetUrl(selectedSchedule.image)}
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
                        <div>
                          <FormFieldHeader label="Email Address" required error={bookingFieldErrors.email} />
                          <input
                            type="email"
                            required
                            value={bookingEmail}
                            onChange={(e) => {
                              setBookingEmail(e.target.value);
                              clearFieldError(setBookingFieldErrors, "email");
                            }}
                            maxLength={EMAIL_MAX_LENGTH}
                            placeholder="Email address"
                            className={getValidationInputClassName({
                              hasError: !!bookingFieldErrors.email,
                              baseClassName:
                                "w-full border-b-2 py-3 text-lg focus:outline-none transition-colors bg-transparent",
                              validClassName: "border-gray-200 focus:border-gray-900",
                              invalidClassName: "border-rose-400 bg-rose-50/30 focus:border-rose-500",
                            })}
                          />
                        </div>

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
  onClick={isOrderable(selectedSchedule) ? handleOrderNow : undefined}
  disabled={!isOrderable(selectedSchedule)}
  className={`w-full border rounded-full py-4 text-xs font-bold tracking-widest uppercase transition-all ${
    isOrderable(selectedSchedule)
      ? "border-gray-200 text-gray-900 hover:border-gray-900 hover:bg-gray-50 hover:-translate-y-1 cursor-pointer"
      : "border-gray-100 text-gray-300 cursor-not-allowed"
  }`}
>
  {getOrderLabel(selectedSchedule)}
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
