/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const ContentContext = createContext();

export const useContents = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [contents, setContents] = useState([]);

  // Fetch all content
  const fetchContents = async () => {
    try {
      const res = await api.get("/contents");
      setContents(res.data);
    } catch (error) {
      console.error("Failed to fetch contents", error);
    }
  };

  // Add new content
  const addContent = async (formData) => {
    try {
      // FIX: Removed manual Content-Type headers so Axios generates the boundary string
      const res = await api.post("/contents", formData);

      setContents((prev) => [res.data.content, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Failed to add content", error);
      throw error;
    }
  };

  // Update content
  const updateContent = async (id, data) => {
    try {
      // FIX: Removed manual Content-Type headers so Axios generates the boundary string
      const res = await api.post(`/contents/${id}?_method=PUT`, data);

      setContents((prev) =>
        prev.map((item) =>
          item.id === id ? res.data.content : item
        )
      );

      return res.data;
    } catch (error) {
      console.error("Failed to update content", error);
      throw error;
    }
  };

  // Archive or restore content
  const toggleArchiveContent = async (content) => {
    try {
      const res = await api.put(`/contents/${content.id}`, {
        isArchived: content.isArchived ? 0 : 1,
      });

      setContents((prev) =>
        prev.map((item) =>
          item.id === content.id ? res.data.content : item
        )
      );

      return res.data;
    } catch (error) {
      console.error("Failed to archive content", error);
      throw error;
    }
  };

  // Delete content permanently
  const deleteContent = async (id) => {
    try {
      await api.delete(`/contents/${id}`);

      setContents((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete content", error);
      throw error;
    }
  };

  // Delete archived content permanently (Admin only)
  const deleteArchivedContent = async (id) => {
    try {
      await api.delete(`/contents/archived/${id}`);

      setContents((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete archived content", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  return (
    <ContentContext.Provider
      value={{
        contents,
        fetchContents,
        addContent,
        updateContent,
        toggleArchiveContent,
        deleteContent,
        deleteArchivedContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};