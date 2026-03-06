/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */


import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token"));

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

  // Detect login/logout by watching token changes
  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem("token");

      if (storedToken !== token) {
        setToken(storedToken);

        if (storedToken) {
          fetchUser(); // user just logged in
        } else {
          setCurrentUser(null); // user logged out
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [token]);

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

  const logoutUser = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Backend logout failed, continuing local logout", err);
    }

    // Clear frontend auth state
    setCurrentUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

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