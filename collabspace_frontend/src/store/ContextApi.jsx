import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

const ContextApi = createContext();

export const ContextProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("JWT_TOKEN"));
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      // Fallback to localStorage user if no token
      const user = JSON.parse(localStorage.getItem("user")) || { userName: "Guest", email: "guest@example.com", role: "User", id: null };
      setCurrentUser(user);
      return;
    }

    try {
      const { data } = await api.get(`/users/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(data);
      setIsAdmin(data.roles?.includes("ROLE_ADMIN") || false);
      // Update localStorage with user data
      localStorage.setItem("user", JSON.stringify({
        userName: data.username,
        email: data.email,
        role: data.roles?.join(",") || "User",
        id: data.id
      }));
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("JWT_TOKEN");
        localStorage.removeItem("user");
        setToken(null);
        toast.error("Session expired. Please log in again.");
      }
      // Fallback to localStorage user or Guest
      const user = JSON.parse(localStorage.getItem("user")) || { userName: "Guest", email: "guest@example.com", role: "User", id: null };
      setCurrentUser(user);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAllUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      const { data } = await api.get(`/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("fetching all the users");
      console.log(data);
      setAllUsers(data);
    } catch (error) {
      console.error("Error fetching all users:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      }
    }
  }, [token]);

  // Function to get user by email
  const getUserByEmail = useCallback((email) => {
    return allUsers.find(user => user.email === email);
  }, [allUsers]);

  useEffect(() => {
    fetchUser();
      fetchAllUsers();
    
  }, [fetchUser, fetchAllUsers]);

  return (
    <ContextApi.Provider
      value={{
        token,
        setToken,
        currentUser,
        loading,
        isAdmin,
        allUsers,
        fetchAllUsers,
        getUserByEmail
      }}
    >
      {children}
    </ContextApi.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(ContextApi);
  if (!context) {
    throw new Error("useMyContext must be used within a ContextProvider");
  }
  return context;
};