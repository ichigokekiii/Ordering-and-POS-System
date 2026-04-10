import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedules");
      setSchedules(res.data);
    } catch (error) {
      console.error("Schedule fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Add schedule
  const addSchedule = async (scheduleData) => {
    try {
      const res = await api.post("/schedules", scheduleData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchSchedules();
      return res.data;
    } catch (error) {
      console.error("Failed to add schedule", error);
      throw error;
    }
  };

  // Update schedule
  const updateSchedule = async (id, updatedData) => {
    try {
      let payload;

      // If the data is already FormData (used when editing with image upload)
      if (updatedData instanceof FormData) {
        if (!updatedData.has("_method")) {
          updatedData.append("_method", "PUT");
        }
        payload = updatedData;
      } else {
        // If it's a normal object (used when toggling archive/restore)
        payload = new FormData();
        Object.keys(updatedData).forEach((key) => {
          payload.append(key, updatedData[key]);
        });
        payload.append("_method", "PUT");
      }

      const res = await api.post(`/schedules/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchSchedules();
      return res.data;
    } catch (error) {
      console.error("Failed to update schedule", error);
      throw error;
    }
  };

  // Delete schedule
  const deleteSchedule = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete schedule", error);
      throw error;
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        fetchSchedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export function useSchedules() {
  return useContext(ScheduleContext);
}
