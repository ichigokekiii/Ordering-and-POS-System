import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchedules } from "../../contexts/ScheduleContext";

function SchedulePage() {
  const { schedules, loading } = useSchedules();

  const navigate = useNavigate();
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const schedulesPerPage = 6;

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
  };

  const handleOrderNow = () => {
    if (selectedSchedule) {
      navigate(`/order?schedule_id=${selectedSchedule.id}`);
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
                  className="rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                >
                  {schedule.image && (
                    <img
                      src={schedule.image}
                      alt={schedule.schedule_name}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">
                      {schedule.schedule_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {schedule.schedule_description}
                    </p>

                    <p className="text-sm text-blue-600 mt-2">
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
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[90%] max-w-3xl overflow-hidden shadow-lg relative">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2">
              {selectedSchedule.image && (
                <img
                  src={selectedSchedule.image}
                  alt={selectedSchedule.schedule_name}
                  className="h-full w-full object-cover"
                />
              )}

              <div className="p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold">
                  {selectedSchedule.schedule_name}
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  {new Date(selectedSchedule.event_date).toLocaleDateString()}
                </p>

                <p className="mt-4 text-gray-600">
                  {selectedSchedule.schedule_description}
                </p>

                <button
                  onClick={handleOrderNow}
                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;