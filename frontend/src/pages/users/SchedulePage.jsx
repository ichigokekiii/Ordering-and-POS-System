import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchedules } from "../../contexts/ScheduleContext";
import api from "../../services/api";

function SchedulePage() {
  const { schedules, loading } = useSchedules();

  const navigate = useNavigate();
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const schedulesPerPage = 6;

  // Booking feedback state
  const [bookingStatus, setBookingStatus] = useState(null); 
  // values: "success" | "error"
  const [bookingMessage, setBookingMessage] = useState("");


  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-semibold">Loading schedules...</h1>
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil(schedules.length / schedulesPerPage);
  const indexOfLast = currentPage * schedulesPerPage;
  const indexOfFirst = indexOfLast - schedulesPerPage;
  const currentSchedules = schedules.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenModal = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    setIsBooking(false);
    setBookingEmail("");
  };

  const handleOrderNow = () => {
    if (selectedSchedule) {
      navigate(`/order?schedule_id=${selectedSchedule.id}`);
    }
  };

  const handleBookClick = () => {
    setIsBooking(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        `/schedules/${selectedSchedule.id}/book`,
        { email: bookingEmail }
      );

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
    <div>
      {/* HERO SECTION */}
      <div className="relative h-[400px] bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1490750967868-88aa4486c946')]">
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold">
              Fresh Flowers <br /> Made Just For You
            </h1>
            <p className="mt-4 text-sm opacity-80">
              Check our latest pop-up schedules and events.
            </p>
          </div>
        </div>
      </div>

      {/* EVENTS SECTION */}
      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6">Pop-Up Events</h2>

        {schedules.length === 0 ? (
          <div className="border p-4 rounded bg-gray-50 text-gray-500">
            No upcoming events available.
          </div>
        ) : (
          <>
            {/* GRID */}
            <div className="grid gap-6 md:grid-cols-3">
              {currentSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={() => handleOpenModal(schedule)}
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-2xl">
                    {schedule.image && (
                      <img
                        src={schedule.image}
                        alt={schedule.schedule_name}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {schedule.schedule_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(schedule.event_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                      currentPage === index + 1
                        ? "bg-[#5C6F9E] text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-[#5C6F9E]/20"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {/* MODAL */}
      {selectedSchedule && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl w-[90%] max-w-3xl h-[420px] shadow-xl relative overflow-hidden">
      
      {/* Close Button */}
      <button
        onClick={handleCloseModal}
        className="absolute top-4 right-6 text-gray-400 hover:text-black text-2xl"
      >
        ✕
      </button>

      <div className="grid md:grid-cols-2 h-full">
        
        {/* IMAGE SIDE (Fixed Size with consistent cropping) */}
        <div className="h-full w-full bg-gray-100 overflow-hidden flex items-center justify-center">
          <img
            src={selectedSchedule.image}
            alt={selectedSchedule.schedule_name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* CONTENT SIDE */}
        <div className="flex flex-col justify-center px-12">
          {isBooking && (
            <button
              onClick={() => setIsBooking(false)}
              className="text-sm text-gray-500 hover:text-[#5C6F9E] mb-4 text-left"
            >
              ← Back
            </button>
          )}
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            {selectedSchedule.schedule_name}
          </h2>

          <p className="mt-5 text-gray-600 text-base">
            {selectedSchedule.schedule_description || "Join us for a special floral pop-up experience."}
          </p>

          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-700">Date:</span>{" "}
              {new Date(selectedSchedule.event_date).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium text-gray-700">Location:</span>{" "}
              {selectedSchedule.location || "Location coming soon"}
            </p>
          </div>

          <div className="mt-8 w-full max-w-xs">
            {!isBooking ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleBookClick}
                  className="w-full border border-gray-300 rounded-xl py-3 text-center font-medium transition-all duration-500 hover:bg-[#5C6F9E] hover:text-white hover:border-[#5C6F9E]"
                >
                  Book Now
                </button>

                <button
                  onClick={handleOrderNow}
                  className="w-full border border-gray-300 rounded-xl py-3 text-center font-medium transition-all duration-500 hover:bg-[#5C6F9E] hover:text-white hover:border-[#5C6F9E]"
                >
                  Order Now
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitBooking}
                className="flex flex-col gap-4 w-full"
              >
                <input
                  type="email"
                  required
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C6F9E]"
                />

                <button
                  type="submit"
                  className="w-full border border-gray-300 rounded-xl py-3 text-center font-medium transition-all duration-500 hover:bg-[#5C6F9E] hover:text-white hover:border-[#5C6F9E]"
                >
                  Book Now
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
    {/* Toast Notification */}
    {bookingStatus && (
      <div className="fixed top-6 right-6 z-[100]">
        <div
          className={`min-w-[280px] max-w-sm rounded-2xl px-5 py-4 shadow-xl border text-sm font-medium transition-all duration-300 ${
            bookingStatus === "success"
              ? "bg-white text-green-700 border-green-200"
              : "bg-white text-red-700 border-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span>{bookingMessage}</span>
            <button
              onClick={() => {
                setBookingStatus(null);
                setBookingMessage("");
              }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
    </div>
  );
}

export default SchedulePage;