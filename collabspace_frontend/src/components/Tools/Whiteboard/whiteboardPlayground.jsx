// src/components/dashboards/WhiteboardPlayground.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { Box, Typography, Button, IconButton, TextField, Modal } from "@mui/material";
import { ArrowBack, Add, Folder as FolderIcon, Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const WhiteboardPlayground = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await api.get(`/whiteboard/${workspaceId}/list`);
        const boardList = response.data.boards || [];
        setBoards(boardList.map(name => ({
          name,
          owner: "Current User",
          createdAt: new Date().toLocaleString(),
        })));
      } catch (error) {
        console.error("Error fetching boards:", error);
        toast.error("Failed to load whiteboards.");
      }
    };
    fetchBoards();
  }, [workspaceId]);

  const handleBoardClick = (board) => {
    navigate(`/whiteboard/${workspaceId}/${board.name}`);
  };

  const handleCreateBoard = async () => {
    if (!newBoardName) {
      toast.error("Board name is required.");
      return;
    }
    try {
      const payload = { workspaceId, boardName: newBoardName, elements: [] };
      await api.post("/whiteboard/save", payload);
      toast.success("Board created!");
      setBoards([...boards, { name: newBoardName, owner: "Current User", createdAt: new Date().toLocaleString() }]);
      setIsCreating(false);
      navigate(`/whiteboard/${workspaceId}/${newBoardName}`);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board.");
    }
  };

  const startRenaming = (item, event) => {
    event.stopPropagation();
    setRenamingItem(item);
    setRenameValue(item.name);
  };

  const handleRename = async (event) => {
    event.stopPropagation();
    if (!renameValue) {
      toast.error("Name cannot be empty.");
      return;
    }
    try {
      const response = await api.get(`/whiteboard/${workspaceId}/${renamingItem.name}`);
      const boardData = response.data.board;
      const payload = { workspaceId, boardName: renameValue, elements: boardData.elements };
      await api.post("/whiteboard/save", payload);
      await api.post("/whiteboard/delete", { workspaceId, boardName: renamingItem.name }); // Optional: delete old board
      setBoards(boards.map(b => b === renamingItem ? { ...b, name: renameValue } : b));
      setRenamingItem(null);
      toast.success(`Renamed to ${renameValue}`);
    } catch (error) {
      console.error("Error renaming board:", error);
      toast.error("Failed to rename board.");
    }
  };

  const handleDelete = async (item, event) => {
    event.stopPropagation();
    try {
      await api.post("/whiteboard/delete", { workspaceId, boardName: item.name });
      setBoards(boards.filter(b => b.name !== item.name));
      toast.success(`Deleted ${item.name}`);
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate(`/dashboard/individual/${workspaceId}`)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e", flexGrow: 1 }}>
          Whiteboard Playground
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreating(true)}
          sx={{ bgcolor: "#1a237e", "&:hover": { bgcolor: "#131a5c" } }}
        >
          New Whiteboard
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 3 }}>
        {boards.map((board) => (
          <motion.div
            key={board.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                bgcolor: "#fff",
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
                "&:hover": { boxShadow: 6 },
                cursor: "pointer",
              }}
              onClick={() => handleBoardClick(board)}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FolderIcon sx={{ color: "#1a237e", mr: 1, fontSize: 30 }} />
                {renamingItem === board ? (
                  <TextField
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRename}
                    onKeyPress={(e) => e.key === "Enter" && handleRename(e)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a237e" }}>{board.name}</Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: "#2e7d32" }}>Owner: {board.owner}</Typography>
              <Typography variant="body2" sx={{ color: "#d81b60" }}>Created: {board.createdAt}</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <IconButton onClick={(e) => startRenaming(board, e)} sx={{ color: "#1a237e" }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={(e) => handleDelete(board, e)} sx={{ color: "#d32f2f" }}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      <Modal open={isCreating} onClose={() => setIsCreating(false)}>
        <Box sx={{ bgcolor: "#fff", p: 4, borderRadius: 2, boxShadow: 2, maxWidth: 500, mx: "auto", mt: "10%", outline: "none" }}>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            <FolderIcon sx={{ mr: 1, color: "#1a237e" }} /> Create New Whiteboard
          </Typography>
          <TextField
            label="Board Name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleCreateBoard}
            sx={{ bgcolor: "#1a237e", "&:hover": { bgcolor: "#131a5c" } }}
          >
            Create & Open
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default WhiteboardPlayground;