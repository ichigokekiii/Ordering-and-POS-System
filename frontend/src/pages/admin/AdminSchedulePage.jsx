import { useEffect, useState } from "react";
import { useSchedules } from "../../contexts/ScheduleContext";

function AdminSchedulePage() {
  const {
    schedules,
    fetchSchedules,
    addSchedule,
    updateSchedule,
  } = useSchedules();

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [scheduleName, setScheduleName] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(1);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("schedule_name", scheduleName);
      formData.append("schedule_description", scheduleDescription);
      formData.append("location", location);
      formData.append("event_date", eventDate);
      formData.append("isAvailable", isAvailable);

      if (image) {
        formData.append("image", image);
      }

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, formData);
        setMessage("Schedule updated successfully!");
      } else {
        await addSchedule(formData);
        setMessage("Schedule added successfully!");
      }

      setMessageType("success");

      setScheduleName("");
      setScheduleDescription("");
      setLocation("");
      setEventDate("");
      setImage(null);
      setIsAvailable(1);
      setEditingSchedule(null);
      setShowModal(false);

    } catch (error) {
      console.error("Schedule operation failed", error);
      setMessage("Operation failed.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleName(schedule.schedule_name);
    setScheduleDescription(schedule.schedule_description);
    setLocation(schedule.location || "");
    setEventDate(schedule.event_date ? schedule.event_date.split(" ")[0] : "");
    setImage(null);
    setIsAvailable(schedule.isAvailable ?? 1);
    setShowModal(true);
  };

  const handleToggleArchive = async (schedule) => {
    try {
      await updateSchedule(schedule.id, {
        isAvailable: schedule.isAvailable ? 0 : 1,
      });

      setMessage(
        schedule.isAvailable
          ? "Schedule archived successfully!"
          : "Schedule restored successfully!"
      );
      setMessageType("success");

      fetchSchedules();
    } catch (error) {
      console.error("Failed to update schedule status", error);
      setMessage("Failed to update schedule.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const activeSchedules = schedules.filter((s) => s.isAvailable);
  const archivedSchedules = schedules.filter((s) => !s.isAvailable);

  return (
    <div className="px-10 py-10">
      {message && (
        <div
          className={`mb-4 rounded px-4 py-2 text-white ${
            messageType === "success"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Schedules</h2>

        <button
          onClick={() => setShowModal(true)}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Schedule
        </button>
      </div>

      <div className="space-y-10">
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 border-b pb-2">Active Schedules</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {activeSchedules.length === 0 ? (
              <p className="text-gray-400">No active schedules</p>
            ) : (
              activeSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="rounded border p-4 shadow-sm"
                >
                  <div className="mb-2">
                    {!schedule.isAvailable ? (
                      <span className="text-xs font-bold text-gray-500">Archived</span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-green-600">
                        <span className="mr-1">✓</span> Active
                      </span>
                    )}
                  </div>
                  {schedule.image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${schedule.image}`}
                      alt={schedule.schedule_name}
                      className="mb-3 h-40 w-full rounded object-cover"
                    />
                  )}

                  <h3 className="font-medium">
                    {schedule.schedule_name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {schedule.schedule_description}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {schedule.location}
                  </p>

                  <p className="mt-2 text-sm text-blue-600">
                    {schedule.event_date?.split(" ")[0]}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleArchive(schedule)}
                      className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 border-b pb-2">Archived Schedules</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {archivedSchedules.length === 0 ? (
              <p className="text-gray-400">No archived schedules</p>
            ) : (
              archivedSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="rounded border p-4 shadow-sm"
                >
                  <div className="mb-2">
                    {!schedule.isAvailable ? (
                      <span className="text-xs font-bold text-gray-500">Archived</span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-green-600">
                        <span className="mr-1">✓</span> Active
                      </span>
                    )}
                  </div>
                  {schedule.image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${schedule.image}`}
                      alt={schedule.schedule_name}
                      className={`mb-3 h-40 w-full rounded object-cover ${!schedule.isAvailable && "grayscale opacity-60"}`}
                    />
                  )}

                  <h3 className="font-medium">
                    {schedule.schedule_name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {schedule.schedule_description}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {schedule.location}
                  </p>

                  <p className="mt-2 text-sm text-blue-600">
                    {schedule.event_date?.split(" ")[0]}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleArchive(schedule)}
                      className="rounded border px-3 py-1 text-sm text-green-700 hover:bg-green-50"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Schedule name"
                value={scheduleName}
                onChange={(e) =>
                  setScheduleName(e.target.value)
                }
                required
              />

              <textarea
                className="w-full rounded border px-4 py-2"
                placeholder="Description"
                value={scheduleDescription}
                onChange={(e) =>
                  setScheduleDescription(e.target.value)
                }
                required
              />

              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              <input
                type="date"
                className="w-full rounded border px-4 py-2"
                value={eventDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />

              <div className="rounded border px-4 py-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Schedule Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm"
                />
                {!image && editingSchedule && (
                  <p className="mt-1 text-xs text-gray-400">
                    No new file chosen — existing image will be kept
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                  }}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editingSchedule ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSchedulePage;
