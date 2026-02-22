import { useEffect, useState } from "react";
import { useSchedules } from "../../contexts/ScheduleContext";

function AdminSchedulePage() {
  const {
    schedules,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedules();

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [scheduleName, setScheduleName] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, {
          schedule_name: scheduleName,
          schedule_description: scheduleDescription,
          event_date: eventDate,
          image: imageUrl,
        });

        setMessage("Schedule updated successfully!");
      } else {
        await addSchedule({
          schedule_name: scheduleName,
          schedule_description: scheduleDescription,
          event_date: eventDate,
          image: imageUrl,
        });

        setMessage("Schedule added successfully!");
      }

      setMessageType("success");

      setScheduleName("");
      setScheduleDescription("");
      setEventDate("");
      setImageUrl("");
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
    setEventDate(schedule.event_date);
    setImageUrl(schedule.image || "");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      setMessage("Schedule deleted successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Failed to delete schedule", error);
      setMessage("Failed to delete schedule.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

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

      <div className="grid gap-6 md:grid-cols-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded border p-4 shadow-sm"
          >
            {schedule.image && (
              <img
                src={schedule.image}
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

            <p className="mt-2 text-sm text-blue-600">
              {schedule.event_date}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(schedule)}
                className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(schedule.id)}
                className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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
                type="date"
                className="w-full rounded border px-4 py-2"
                value={eventDate}
                onChange={(e) =>
                  setEventDate(e.target.value)
                }
                required
              />

              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChange={(e) =>
                  setImageUrl(e.target.value)
                }
              />

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
