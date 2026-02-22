

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
      const res = await api.post("/schedules", scheduleData);
      setSchedules((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Failed to add schedule", error);
      throw error;
    }
  };

  // Update schedule
  const updateSchedule = async (id, updatedData) => {
    try {
      const res = await api.put(`/schedules/${id}`, updatedData);
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? res.data : s))
      );
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