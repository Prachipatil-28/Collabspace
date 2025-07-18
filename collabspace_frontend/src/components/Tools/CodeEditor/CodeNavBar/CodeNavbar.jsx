// src/components/Tools/CodeEditor/CodeNavBar/CodeNavbar.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { Add, Save, AccountCircle } from "@mui/icons-material";
import { styled } from "@mui/system";
import api from "../../../../api/api";
import toast from "react-hot-toast";

const StyledToolbar = styled(Toolbar)({
  justifyContent: "space-between",
});

const EnhancedNavbar = () => {
  const handleNewFile = () => {
    window.dispatchEvent(new CustomEvent("newFile"));
  };

  const handleSave = async () => {
    try {
      const files = JSON.parse(localStorage.getItem("files") || "[]");
      const payload = { files };
      await api.post("/code/save", payload); // Adjust endpoint as needed
      toast.success("Project saved!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project.");
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={4}>
      <StyledToolbar>
        <Typography variant="h6" component="div">
          Collaborative IDE
        </Typography>
        <div>
          <Button color="inherit" startIcon={<Add />} onClick={handleNewFile}>
            New File
          </Button>
          <Button color="inherit" startIcon={<Save />} onClick={handleSave}>
            Save
          </Button>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </div>
      </StyledToolbar>
    </AppBar>
  );
};

export default EnhancedNavbar;