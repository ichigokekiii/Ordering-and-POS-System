/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSchedules } from "../../contexts/ScheduleContext";
import { CalendarPlus, MapPin, CalendarClock, Pencil, Archive, ArchiveRestore, CheckCircle2, X } from "lucide-react";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_IMAGE_NAME_REGEX = /\.(jpe?g|png|gif)$/i;
const ADMIN_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif";

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

  // Inline errors state
  const [errors, setErrors] = useState({});

  // Replaced Toast with Modal System
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' });
  const asBoolean = (value) => value === 1 || value === true || value === "1";

  useEffect(() => {
    fetchSchedules();
  }, []);

  const showModalAlert = (type, message) => {
    setStatusModal({ isOpen: true, type, message });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const hasValidMimeType = !file.type || ALLOWED_IMAGE_TYPES.includes(file.type);
    const hasValidExtension = ALLOWED_IMAGE_NAME_REGEX.test(file.name || "");

    if (!hasValidMimeType || !hasValidExtension) {
      setErrors((prev) => ({ ...prev, image: ["Only JPG, JPEG, PNG, and GIF files are allowed."] }));
      setImage(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, image: ["Image must be 5MB or smaller."] }));
      setImage(null);
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, image: null }));
    setImage(file);
  };

  const resetForm = () => {
    setScheduleName("");
    setScheduleDescription("");
    setLocation("");
    setEventDate("");
    setImage(null);
    setIsAvailable(1);
    setEditingSchedule(null);
    setShowModal(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- FRONTEND VALIDATION ---
    const newErrors = {};
    const locationRegex = /^[a-zA-Z0-9\s\-.,#]+$/;
    const htmlRegex = /<[^>]*>/g;

    // Validate Event Name
    if (!scheduleName.trim()) {
      newErrors.schedule_name = ["This field is required"];
    } else if (htmlRegex.test(scheduleName)) {
      newErrors.schedule_name = ["Event Name cannot contain HTML tags."];
    }

    // Validate Location
    if (!location.trim()) {
      newErrors.location = ["This field is required"];
    } else if (!locationRegex.test(location)) {
      newErrors.location = ["Location contains invalid symbols."];
    }

    // Validate Date
    if (!eventDate) {
      newErrors.event_date = ["This field is required"];
    }

    // Validate Description
    if (!scheduleDescription.trim()) {
      newErrors.schedule_description = ["This field is required"];
    } else if (htmlRegex.test(scheduleDescription)) {
      newErrors.schedule_description = ["Description cannot contain HTML tags."];
    }

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        showModalAlert("success", "Schedule updated successfully!");
      } else {
        await addSchedule(formData);
        showModalAlert("success", "Schedule created successfully!");
      }

      resetForm();

    } catch (error) {
      console.error("Schedule operation failed", error);
      // Parse backend validation error response (422) for inline display
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        showModalAlert("error", "Operation failed. Please try again.");
      }
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleName(schedule.schedule_name);
    setScheduleDescription(schedule.schedule_description);
    setLocation(schedule.location || "");
    setEventDate(schedule.event_date ? schedule.event_date.split(" ")[0] : "");
    setImage(null);
    setIsAvailable(asBoolean(schedule.isAvailable) ? 1 : 0);
    setShowModal(true);
    setErrors({});
  };

  const handleToggleArchive = async (schedule) => {
    try {
      await updateSchedule(schedule.id, {
        isArchived: asBoolean(schedule.isArchived) ? 0 : 1,
      });

      showModalAlert("success", asBoolean(schedule.isArchived) ? "Schedule restored successfully." : "Schedule archived successfully.");
      fetchSchedules();
    } catch (error) {
      console.error("Failed to update schedule status", error);
      showModalAlert("error", "Failed to update schedule status.");
    }
  };

  const activeSchedules = schedules.filter((s) => !asBoolean(s.isArchived));
  const liveSchedules = activeSchedules.filter((s) => asBoolean(s.isAvailable));
  const inactiveSchedules = activeSchedules.filter((s) => !asBoolean(s.isAvailable));
  const archivedSchedules = schedules.filter((s) => asBoolean(s.isArchived));

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
    return `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${imagePath}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
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
                resetForm();
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
            {liveSchedules.length} Live
          </span>
        </div>

        {liveSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
            <CalendarClock size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold text-gray-500">No active events currently scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveSchedules.map((schedule) => (
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
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                      Active
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

      {/* INACTIVE SCHEDULES SECTION */}
      <div className="mb-16">
        <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-playfair font-bold text-gray-900">Inactive Events</h3>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest border border-amber-100">
            {inactiveSchedules.length} Coming Soon
          </span>
        </div>

        {inactiveSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
            <CalendarClock size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold text-gray-500">No inactive events currently listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inactiveSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                onClick={() => canEdit && handleEdit(schedule)}
                className={`flex flex-col bg-white rounded-[1.5rem] border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#4f6fa5] transition-all overflow-hidden group ${canEdit ? 'cursor-pointer' : ''}`}
              >
                <div className="h-48 bg-gray-100 border-b border-gray-100 relative overflow-hidden">
                  <img src={getImageUrl(schedule.image)} alt={schedule.schedule_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[0.1]" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
                      {new Date(schedule.event_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-amber-500/90 px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                      Inactive
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
          <div className="bg-white rounded-[2rem] w-[90%] max-w-lg shadow-2xl border border-white/20 p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            <div className="mb-6">
              <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-3 inline-block">
                Event Management
              </span>
              <h2 className="text-2xl font-playfair font-bold text-gray-900">
                {editingSchedule ? "Edit Schedule Details" : "Create New Event"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Event Name</label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => {
                    setScheduleName(e.target.value);
                    if (errors.schedule_name) setErrors(prev => ({ ...prev, schedule_name: null }));
                  }}
                  placeholder="e.g. Summer Floral Workshop"
                  className={`w-full rounded-xl border ${errors.schedule_name ? 'border-rose-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900`}
                />
                {/* Inline Validation Error */}
                {errors.schedule_name && (
                  <p className="text-rose-500 text-[10px] font-bold mt-1.5 uppercase tracking-wide">
                    {errors.schedule_name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors(prev => ({ ...prev, location: null }));
                  }}
                  placeholder="e.g. Petal Express Main Studio"
                  className={`w-full rounded-xl border ${errors.location ? 'border-rose-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900`}
                />
                {/* Inline Validation Error */}
                {errors.location && (
                  <p className="text-rose-500 text-[10px] font-bold mt-1.5 uppercase tracking-wide">
                    {errors.location[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    if (errors.event_date) setErrors(prev => ({ ...prev, event_date: null }));
                  }}
                  className={`w-full rounded-xl border ${errors.event_date ? 'border-rose-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900`}
                />
                {/* Inline Validation Error */}
                {errors.event_date && (
                  <p className="text-rose-500 text-[10px] font-bold mt-1.5 uppercase tracking-wide">
                    {errors.event_date[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Description</label>
                <textarea
                  value={scheduleDescription}
                  onChange={(e) => {
                    setScheduleDescription(e.target.value);
                    if (errors.schedule_description) setErrors(prev => ({ ...prev, schedule_description: null }));
                  }}
                  placeholder="Provide event details, requirements, or marketing copy..."
                  className={`min-h-24 w-full rounded-xl border ${errors.schedule_description ? 'border-rose-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all text-gray-700 leading-relaxed`}
                />
                {/* Inline Validation Error */}
                {errors.schedule_description && (
                  <p className="text-rose-500 text-[10px] font-bold mt-1.5 uppercase tracking-wide">
                    {errors.schedule_description[0]}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Availability</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAvailable(1)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      isAvailable === 1
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest">Active</p>
                    <p className="mt-1 text-xs font-medium">Customers can place orders for this event.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(0)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      isAvailable === 0
                        ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest">Inactive</p>
                    <p className="mt-1 text-xs font-medium">Visible for updates only. Ordering stays disabled.</p>
                  </button>
                </div>
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
                  accept={ADMIN_IMAGE_ACCEPT}
                  onChange={handleImageChange}
                  className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-gray-600 hover:file:bg-gray-200 transition-all cursor-pointer"
                />
                <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  JPG, JPEG, PNG, or GIF only. Max 5MB.
                </p>
                {!image && editingSchedule && (
                  <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    Note: Current image will be kept if no new file is chosen.
                  </p>
                )}
                {errors.image && (
                  <p className="mt-2 text-xs text-rose-500">
                    {errors.image[0]}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
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

      {/* --- STATUS ALERT MODAL (Replaces Toast) --- */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[400] p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${statusModal.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'}`}>
               {statusModal.type === 'success' ? <CheckCircle2 size={28} /> : <X size={28} />}
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
              {statusModal.type === 'success' ? 'Success' : 'Action Failed'}
            </h3>
            <p className="text-sm text-gray-500 mb-8 px-2">{statusModal.message}</p>
            <div className="flex justify-center">
              <button 
                onClick={() => setStatusModal({ isOpen: false, type: 'success', message: '' })} 
                className="rounded-xl bg-gray-900 px-8 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminSchedulePage;
