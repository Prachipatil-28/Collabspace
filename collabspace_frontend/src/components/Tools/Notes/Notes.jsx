import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "../../../api/api";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { Save, Download, Publish, People } from "@mui/icons-material";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import { useMyContext } from "../../../store/ContextApi";

const ImageBlot = Quill.import("formats/image");
class ResizableImageBlot extends ImageBlot {
  static create(value) {
    const node = super.create(value);
    node.setAttribute("contenteditable", "false");
    node.setAttribute("draggable", "true");
    node.style.position = "relative";
    node.style.cursor = "move";
    return node;
  }

  static formats(node) {
    return {
      src: node.getAttribute("src"),
      width: node.style.width || "auto",
      height: node.style.height || "auto",
    };
  }

  format(name, value) {
    if (name === "width" || name === "height") {
      this.domNode.style[name] = value;
    } else {
      super.format(name, value);
    }
  }
}
Quill.register("formats/image", ResizableImageBlot);

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: Array.from({ length: 29 }, (_, i) => `${8 + i}px`) }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["link", "image"],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["clean"],
];

const Notepad = ({ isCollaborative = true }) => {
  const { workspaceId, noteName } = useParams();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [saveFormat, setSaveFormat] = useState("pdf");
  const wsRef = useRef(null);
  const [workspaceType, setWorkspaceType] = useState("individual");
  const [isOwner, setIsOwner] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [participants, setParticipants] = useState([]);
  const [participantDetails, setParticipantDetails] = useState({});
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [userPermission, setUserPermission] = useState("edit");
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { currentUser } = useMyContext();

  // Fetch workspace and user permissions
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        const workspaceData = response.data;
        setWorkspaceType(workspaceData.type);
        setIsOwner(workspaceData.owner === currentUser?.id);
        setPermissions(workspaceData.permissions || {});
        setParticipants(workspaceData.participants || []);
        if (workspaceData.type === "individual" || workspaceData.owner === currentUser?.id) {
          setUserPermission("edit");
        } else {
          setUserPermission(workspaceData.permissions[currentUser?.id] || "view");
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace data.");
      }
    };

    fetchWorkspace();
  }, [workspaceId, currentUser?.id]);

  // Fetch participant details if participants contains only IDs
  useEffect(() => {
    const fetchParticipantDetails = async () => {
      try {
        const details = {};
        for (const participant of participants) {
          if (typeof participant === "string") {
            // Fetch user details if participants is a list of IDs
            const response = await api.get(`/users/${participant}`);
            details[participant] = response.data; // { id, username }
          } else {
            // Use participant object directly if it includes details
            details[participant.id] = participant;
          }
        }
        setParticipantDetails(details);
      } catch (error) {
        console.error("Error fetching participant details:", error);
        toast.error("Failed to load participant details.");
      }
    };

    if (participants.length > 0) {
      fetchParticipantDetails();
    }
  }, [participants]);

  // Initialize Quill editor and set read-only mode
  useEffect(() => {
    if (quillRef.current && !quill) {
      const editor = new Quill(quillRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
          history: {
            delay: 2000,
            maxStack: 500,
          },
        },
        placeholder: "Start typing your note here...",
      });
      setQuill(editor);

      const fetchNote = async () => {
        try {
          const response = await api.get(`/notes/${workspaceId}/${noteName}`);
          if (response.data.content) {
            editor.setContents(JSON.parse(response.data.content));
          }
        } catch (error) {
          console.error("Error fetching note:", error);
          toast.error("Failed to load note.");
        }
      };
      fetchNote();

      editor.getModule("toolbar").addHandler("image", () => {
        if (userPermission !== "edit") {
          toast.error("You do not have edit permissions.");
          return;
        }
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.onchange = () => {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", e.target.result);
            setTimeout(() => {
              const imgs = quillRef.current.querySelectorAll("img");
              imgs.forEach((img) => {
                img.setAttribute("contenteditable", "false");
                img.style.resize = "both";
                img.style.overflow = "auto";
                img.style.maxWidth = "100%";
                img.style.maxHeight = "100%";
                img.style.display = "inline-block";
                img.addEventListener("mousedown", (event) => {
                  event.preventDefault();
                });
              });
            }, 100);
          };
          reader.readAsDataURL(file);
        };
      });

      return () => {
        editor.off("text-change");
      };
    }
  }, [quill, workspaceId, noteName, userPermission]);

  // Set Quill editor read-only based on userPermission
  useEffect(() => {
    if (quill) {
      quill.enable(userPermission === "edit");
    }
  }, [quill, userPermission]);

  // WebSocket setup and reconnection logic
  useEffect(() => {
    if (workspaceType !== "group" && workspaceType !== "team") return;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket(`ws://192.168.231.184:8080/ws/workspace/${workspaceId}`);
      wsRef.current.onopen = () => {
        console.log("Workspace WebSocket connected for workspace:", workspaceId);
        reconnectAttempts.current = 0;
        toast.success("Collaboration enabled!");
      };
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case "NOTE_UPDATE":
              if (message.noteName.toLowerCase() === noteName.toLowerCase() && quill) {
                quill.setContents(JSON.parse(message.content));
              }
              break;
            case "NOTIFICATION":
              console.log("Notification:", message.notification);
              toast.info(message.notification.message);
              break;
            case "MEMBER_ADDED":
              console.log("Participant added:", message.data);
              setParticipants((prev) => {
                const newParticipant = typeof message.data === "string" ? message.data : message.data;
                return [...prev, newParticipant];
              });
              toast.success("New participant added to workspace!");
              break;
            case "MEMBER_REMOVED":
              console.log("Participant removed:", message.data);
              setParticipants((prev) => prev.filter((p) => (typeof p === "string" ? p : p.id) !== message.data));
              toast.success("Participant removed from workspace!");
              break;
            case "PERMISSION_UPDATE":
              setPermissions(message.data);
              setUserPermission(message.data[currentUser?.id] || "view");
              toast.success("Permissions updated!");
              break;
            default:
              console.log("Unhandled workspace message:", message);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      wsRef.current.onclose = () => {
        console.log("Workspace WebSocket disconnected");
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
            reconnectAttempts.current += 1;
            connectWebSocket();
          }, 3000);
        } else {
          toast.error("Lost connection to collaboration server.");
        }
      };
      wsRef.current.onerror = (error) => {
        console.error("Workspace WebSocket error:", error);
        toast.error("Collaboration connection error.");
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [workspaceType, workspaceId, noteName, currentUser?.id]);

  // Attach text-change listener for Quill
  useEffect(() => {
    if (quill && wsRef.current && (workspaceType === "group" || workspaceType === "team")) {
      const handler = () => {
        if (userPermission !== "edit") {
          toast.error("You do not have edit permissions.");
          return;
        }
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const delta = quill.getContents();
          console.log("Sending NOTE_UPDATE:", { type: "NOTE_UPDATE", workspaceId, noteName, content: JSON.stringify(delta) });
          wsRef.current.send(
            JSON.stringify({
              type: "NOTE_UPDATE",
              workspaceId,
              noteName,
              content: JSON.stringify(delta),
              userId: currentUser?.id,
            })
          );
        }
      };
      quill.on("text-change", handler);
      return () => {
        quill.off("text-change", handler);
      };
    }
  }, [quill, workspaceType, userPermission, workspaceId, noteName, currentUser?.id]);

  // Update participant permissions
  const updateParticipantPermission = async (userId, permission) => {
    try {
      const updatedPermissions = { ...permissions, [userId]: permission };
      await api.post(`/workspace/${workspaceId}/permissions`, updatedPermissions);
      setPermissions(updatedPermissions);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "PERMISSION_UPDATE",
            data: updatedPermissions,
            workspaceId,
          })
        );
      }
      toast.success(`Permission for user ${userId} updated to ${permission}!`);
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions.");
    }
  };

  const saveNote = async () => {
    if (!quill || isSaving) return;
    if (userPermission !== "edit") {
      toast.error("You do not have edit permissions.");
      return;
    }
    setIsSaving(true);
    try {
      const delta = quill.getContents();
      const content = JSON.stringify(delta);
      await api.post("/notes/save", { workspaceId, sessionId: noteName, noteName, content });
      toast.success("Note saved successfully!");
      if ((workspaceType === "group" || workspaceType === "team") && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "NOTIFICATION",
            workspaceId,
            notification: { message: `Note "${noteName}" saved.` },
          })
        );
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsFile = () => {
    if (!quill) return;
    setOpenSaveDialog(true);
  };

  const handleSaveFile = () => {
    if (!quill) return;

    const htmlContent = quill.root.innerHTML;
    const textContent = quill.getText();

    switch (saveFormat) {
      case "pdf":
        html2pdf()
          .from(htmlContent)
          .set({
            margin: 1,
            filename: `${noteName}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          })
          .save();
        break;
      case "txt":
        const txtBlob = new Blob([textContent], { type: "text/plain" });
        saveAs(txtBlob, `${noteName}.txt`);
        break;
      case "docx":
        const docxBlob = new Blob([htmlContent], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        saveAs(docxBlob, `${noteName}.docx`);
        break;
      default:
        break;
    }
    toast.success(`Note saved as ${saveFormat.toUpperCase()}!`);
    setOpenSaveDialog(false);
  };

  const publishNote = async () => {
    if (!quill) return;
    if (userPermission !== "edit") {
      toast.error("You do not have edit permissions.");
      return;
    }
    try {
      await api.post(`/notes/${workspaceId}/${noteName}/publish`, null, {
        params: { author: currentUser?.username || "Current User" },
      });
      toast.success("Note published successfully!");
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "1400px",
          p: 2,
          mb: 2,
          bgcolor: "#ffffff",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          {noteName}
        </Typography>
        <Box>
          <IconButton
            onClick={saveNote}
            disabled={isSaving || userPermission !== "edit"}
            sx={{ color: "#4caf50", mr: 1 }}
            title="Save"
          >
            <Save />
          </IconButton>
          <IconButton
            onClick={saveAsFile}
            sx={{ color: "#0288d1", mr: 1 }}
            title="Download"
          >
            <Download />
          </IconButton>
          <IconButton
            onClick={publishNote}
            disabled={userPermission !== "edit"}
            sx={{ color: "#f57c00", mr: 1 }}
            title="Publish"
          >
            <Publish />
          </IconButton>
          {isOwner && (
            <Tooltip title="Manage Permissions">
              <IconButton
                onClick={() => setIsPermissionsModalOpen(true)}
                sx={{ color: "#0288d1" }}
              >
                <People />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "1400px",
          p: 2,
          bgcolor: "#ffffff",
          borderRadius: "8px",
          "& .ql-toolbar": {
            borderRadius: "8px 8px 0 0",
            background: "linear-gradient(90deg, #1a237e, #3f51b5)",
            "& .ql-picker-label, & .ql-button": {
              color: "#ffffff",
            },
            "& .ql-stroke": {
              stroke: "#ffffff",
            },
          },
          "& .ql-container": {
            minHeight: "500px",
            borderRadius: "0 0 8px 8px",
            border: "1px solid #e0e0e0",
            "& .ql-editor": {
              fontSize: "16px",
            },
          },
        }}
      >
        <div ref={quillRef} />
      </Paper>

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={saveNote}
          disabled={isSaving || userPermission !== "edit"}
          sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
        >
          Save Note
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={saveAsFile}
          sx={{ bgcolor: "#0288d1", "&:hover": { bgcolor: "#0277bd" } }}
        >
          Download
        </Button>
        <Button
          variant="contained"
          startIcon={<Publish />}
          onClick={publishNote}
          disabled={userPermission !== "edit"}
          sx={{ bgcolor: "#f57c00", "&:hover": { bgcolor: "#e64a19" } }}
        >
          Publish
        </Button>
      </Box>

      {/* Save As Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Save Note As</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>File Format</InputLabel>
            <Select
              value={saveFormat}
              onChange={(e) => setSaveFormat(e.target.value)}
              label="File Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="txt">TXT</MenuItem>
              <MenuItem value="docx">DOCX</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFile} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Permission</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => {
                  const userId = typeof participant === "string" ? participant : participant.id;
                  const username = participantDetails[userId]?.username || userId;
                  return (
                    <TableRow key={userId}>
                      <TableCell>{userId}</TableCell>
                      <TableCell>{username}</TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <Select
                            value={permissions[userId] || "view"}
                            onChange={(e) => updateParticipantPermission(userId, e.target.value)}
                            disabled={userId === currentUser?.id || !isOwner}
                          >
                            <MenuItem value="view">View</MenuItem>
                            <MenuItem value="edit">Edit</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPermissionsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notepad;