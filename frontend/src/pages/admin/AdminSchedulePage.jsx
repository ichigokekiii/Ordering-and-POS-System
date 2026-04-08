/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { useSchedules } from "../../contexts/ScheduleContext";
import { CalendarPlus, MapPin, CalendarClock, Pencil, Archive, ArchiveRestore, CheckCircle2, X } from "lucide-react";

function AdminSchedulePage({ user }) {
  const {
    schedules,
    fetchSchedules,
    addSchedule,
    updateSchedule,
  } = useSchedules();

  const canEdit = user?.role === "admin" || user?.role === "owner";

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [scheduleName, setScheduleName] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(1);

  // Modern Toast State
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    fetchSchedules();
    return () => clearTimeout(toastTimeoutRef.current);
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

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
        showToast("success", "Schedule updated successfully!");
      } else {
        await addSchedule(formData);
        showToast("success", "Schedule created successfully!");
      }

      // Reset form
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
      showToast("error", "Operation failed. Please try again.");
    }
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

      showToast("success", schedule.isAvailable ? "Schedule archived successfully." : "Schedule restored successfully.");
      fetchSchedules();
    } catch (error) {
      console.error("Failed to update schedule status", error);
      showToast("error", "Failed to update schedule status.");
    }
  };

  const activeSchedules = schedules.filter((s) => s.isAvailable);
  const archivedSchedules = schedules.filter((s) => !s.isAvailable);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
    return `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${imagePath}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed top-6 right-6 z-[500] animate-in slide-in-from-right duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* HEADER AREA */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">Event Schedules</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">
            Manage upcoming pop-ups, floral workshops, and special promotional events.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!canEdit && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100">
              View-Only Access
            </span>
          )}
          {canEdit && (
            <button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleName(""); setScheduleDescription(""); setLocation(""); setEventDate(""); setImage(null); setIsAvailable(1);
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" />
              Add New Event
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE SCHEDULES SECTION */}
      <div className="mb-16">
        <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-playfair font-bold text-gray-900">Active Events</h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest border border-emerald-100">
            {activeSchedules.length} Live
          </span>
        </div>

        {activeSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
            <CalendarClock size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold text-gray-500">No active events currently scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                onClick={() => canEdit && handleEdit(schedule)}
                className={`flex flex-col bg-white rounded-[1.5rem] border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#4f6fa5] transition-all overflow-hidden group ${canEdit ? 'cursor-pointer' : ''}`}
              >
                <div className="h-48 bg-gray-100 border-b border-gray-100 relative overflow-hidden">
                  <img src={getImageUrl(schedule.image)} alt={schedule.schedule_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
                      {new Date(schedule.event_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-playfair font-bold text-gray-900 mb-1 line-clamp-1">{schedule.schedule_name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{schedule.schedule_description}</p>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4f6fa5] mb-4 mt-auto">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{schedule.location}</span>
                  </div>
                  
                  {canEdit && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(schedule); }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleArchive(schedule); }}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-white border-2 border-amber-500 hover:bg-transparent hover:text-amber-500 transition-all duration-300 shadow-sm"
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ARCHIVED SCHEDULES SECTION */}
      <div>
        <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-playfair font-bold text-gray-400">Archived Events</h3>
          {archivedSchedules.length > 0 && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {archivedSchedules.length} Hidden
            </span>
          )}
        </div>

        {archivedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
            <Archive size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold text-gray-500">No archived schedules found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-75 hover:opacity-100 transition-opacity">
            {archivedSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                onClick={() => canEdit && handleEdit(schedule)}
                className={`flex flex-col bg-gray-50 rounded-[1.5rem] border border-gray-200 overflow-hidden hover:shadow-md transition-all ${canEdit ? 'cursor-pointer' : ''}`}
              >
                <div className="h-32 bg-gray-200 border-b border-gray-200 relative overflow-hidden grayscale">
                  <img src={getImageUrl(schedule.image)} alt={schedule.schedule_name} className="w-full h-full object-cover" />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-playfair font-bold text-gray-600 mb-1 truncate">{schedule.schedule_name}</h3>
                  <p className="text-xs text-gray-400 truncate mb-4">{schedule.location} • {new Date(schedule.event_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric'})}</p>
                  
                  {canEdit && (
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(schedule); }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleArchive(schedule); }}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white border-2 border-emerald-500 hover:bg-transparent hover:text-emerald-600 transition-all duration-300 shadow-sm"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" /> Restore
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && canEdit && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-white rounded-[2rem] w-[90%] max-w-lg shadow-2xl border border-white/20 p-8 max-h-[90vh] overflow-y-auto">
            
            <div className="mb-6">
              <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-3 inline-block">
                Event Management
              </span>
              <h2 className="text-2xl font-playfair font-bold text-gray-900">
                {editingSchedule ? "Edit Schedule Details" : "Create New Event"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Event Name</label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="e.g. Summer Floral Workshop"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Petal Express Main Studio"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Description</label>
                <textarea
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  placeholder="Provide event details, requirements, or marketing copy..."
                  className="min-h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all text-gray-700 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Cover Image</label>
                {editingSchedule?.image && !image && (
                  <div className="mb-3 h-24 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={getImageUrl(editingSchedule.image)} alt="Current cover" className="h-full w-full object-cover opacity-70" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-gray-600 hover:file:bg-gray-200 transition-all cursor-pointer"
                />
                {!image && editingSchedule && (
                  <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    Note: Current image will be kept if no new file is chosen.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                  }}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
                >
                  {editingSchedule ? "Save Changes" : "Publish Event"}
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