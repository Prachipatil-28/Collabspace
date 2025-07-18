import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { Box, Typography, Button, IconButton, Card, CardContent, CardActions } from "@mui/material";
import { Add, Publish } from "@mui/icons-material";

const NotesPlayground = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [newNoteName, setNewNoteName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("individual");
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        setWorkspaceType(response.data.type);
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace data.");
      }
    };

    const fetchNotes = async () => {
      try {
        const response = await api.get(`/notes/${workspaceId}/list`);
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error("Failed to load notes.");
      }
    };

    fetchWorkspace();
    fetchNotes();

    // Initialize WebSocket for collaborative workspaces
  /*  if (workspaceType === "group" || workspaceType === "team") {
      wsRef.current = new WebSocket(`ws://localhost:8080/ws/workspace/${workspaceId}`);
      wsRef.current.onopen = () => {
        console.log("Workspace WebSocket connected for workspace:", workspaceId);
      };
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "NOTIFICATION":
            console.log("Notification:", message.notification);
            toast.info(message.notification.message);
            break;
          case "MEMBER_ADDED":
            console.log("Member added:", message.data);
            toast.success("New member added to workspace!");
            break;
          case "MEMBER_REMOVED":
            console.log("Member removed:", message.data);
            toast.success("Member removed from workspace!");
            break;
          default:
            console.log("Unhandled workspace message:", message);
        }
      };
      wsRef.current.onclose = () => {
        console.log("Workspace WebSocket disconnected");
      };
      wsRef.current.onerror = (error) => {
        console.error("Workspace WebSocket error:", error);
      };

      return () => {
        if (wsRef.current) wsRef.current.close();
      };
    }*/
  }, [workspaceId, workspaceType]);

  const createNote = async () => {
    if (!newNoteName) {
      toast.error("Please enter a note name.");
      return;
    }
    try {
      await api.post(`/notes/${workspaceId}/${newNoteName}/create`);
      setNotes([...notes, newNoteName]);
      setNewNoteName("");
      navigate(`/notepad/${workspaceId}/${newNoteName}`);
      // Send notification via WebSocket for collaborative workspaces
      if ((workspaceType === "group" || workspaceType === "team") && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "NOTIFICATION",
            workspaceId,
            notification: { message: `New note "${newNoteName}" created.` },
          })
        );
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note.");
    }
  };

  const publishNote = async (noteName) => {
    try {
      await api.post(`/notes/${workspaceId}/${noteName}/publish`);
      toast.success(`Note "${noteName}" published!`);
      // Send notification via WebSocket for collaborative workspaces
      if ((workspaceType === "group" || workspaceType === "team") && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "NOTIFICATION",
            workspaceId,
            notification: { message: `Note "${noteName}" published.` },
          })
        );
      }
    } catch (error) {
      console.error("Error publishing note:", error);
      toast.error("Failed to publish note.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8", p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e", mb: 4 }}>
        Notes Playground
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <input
          value={newNoteName}
          onChange={(e) => setNewNoteName(e.target.value)}
          placeholder="New Note Name"
          className="w-64 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
        />
        <IconButton
          onClick={createNote}
          sx={{ bgcolor: "#1a237e", color: "#fff", "&:hover": { bgcolor: "#3f51b5" } }}
        >
          <Add />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {notes.length > 0 ? (
          notes.map((noteName) => (
            <Card key={noteName} sx={{ width: 200, boxShadow: 2 }}>
              <CardContent onClick={() => navigate(`/notepad/${workspaceId}/${noteName}`)}>
                <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                  {noteName}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  onClick={() => publishNote(noteName)}
                  startIcon={<Publish />}
                  sx={{ color: "#1a237e" }}
                >
                  Publish
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <Typography sx={{ color: "#888" }}>No notes available.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default NotesPlayground;