import React, { createContext, useEffect, useState } from "react";
import api from "../api/api";
import { useMyContext } from "./ContextApi";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { token, currentUser, loading } = useMyContext();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Fetch all workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (loading || !currentUser?.id) {
        console.log("Skipping fetchWorkspaces: loading or currentUser.id not available");
        return;
      }
      try {
        const response = await api.get(`/workspace/user/${currentUser.id}`);
        setWorkspaces(response.data);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast.error("Failed to load workspaces.");
      }
    };
    fetchWorkspaces();
  }, [loading, currentUser]);

  // Fetch sessions for the active workspace
  useEffect(() => {
    const fetchSessions = async () => {
      if (!activeWorkspace?.workspaceId) {
        console.log("Skipping fetchSessions: activeWorkspace not available");
        return;
      }
      try {
        const response = await api.get(`/session/${activeWorkspace.workspaceId}`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load sessions.");
      }
    };
    fetchSessions();
  }, [activeWorkspace]);

  return (
    <AppContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        sessions,
        setSessions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
