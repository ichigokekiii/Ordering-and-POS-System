/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */


import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const NavbarContext = createContext();

const mapProfileToNavbarUser = (profile) => {
  if (!profile) return null;

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone_number: profile.phone_number,
    profile_picture: profile.profile_picture,
    role: profile.role,
  };
};

export function NavbarProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(window.sessionStorage.getItem("token"));

  // Fetch user from backend
  const fetchUser = async () => {
    const storedToken = window.sessionStorage.getItem("token");

    if (!storedToken) {
      setCurrentUser(null);
      localStorage.removeItem("user");
      return;
    }

    try {
      const res = await api.get("/profile");
      if (res.data) {
        setCurrentUser(mapProfileToNavbarUser(res.data));
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to fetch navbar user", error.response?.data || error.message);
      setCurrentUser(null);
      window.sessionStorage.removeItem("token");
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
      const storedToken = window.sessionStorage.getItem("token");

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
    localStorage.removeItem("user");
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
    window.sessionStorage.removeItem("token");

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
