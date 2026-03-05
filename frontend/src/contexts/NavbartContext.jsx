/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */


import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Fetch user from backend
  const fetchUser = async () => {
    try {
      const res = await api.get("/profile");
      if (res.data) {
        setCurrentUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch {
      setCurrentUser(null);
      localStorage.removeItem("user");
    }
  };

  // Run once on app load
  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for updates across tabs or manual dispatch
  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setCurrentUser(storedUser);
      fetchUser();
    };

    window.addEventListener("storage", handleUserUpdate);
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  const updateUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("userUpdated"));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
  };

  return (
    <NavbarContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateUser,
        logoutUser,
        fetchUser,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavbarContext);
}