import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, PlusCircle, Brain, ThumbsUp } from "lucide-react";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

const IdeasBoard = ({ workspaceId, currentUser, isLeader, ideas, setIdeas, wsRef, getUserDisplayName }) => {
  const [newIdea, setNewIdea] = useState({ title: "", description: "" });
  const [showIdeaPopup, setShowIdeaPopup] = useState(false);

  // Fetch ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await api.get(`/api/workspace/${workspaceId}/ideas`);
        setIdeas(response.data);
      } catch (error) {
        console.error("Error fetching ideas:", error);
        toast.error("Failed to load ideas.");
      }
    };
    fetchIdeas();
  }, [workspaceId, setIdeas]);

  const handleIdeaSubmit = async () => {
    if (!newIdea.title.trim() || !newIdea.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    const ideaPayload = {
      ...newIdea,
      workspaceId,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString(),
      votes: 0,
      voters: []
    };
    try {
      const response = await api.post(`/api/workspace/${workspaceId}/ideas`, ideaPayload);
      setIdeas((prev) => [...prev, response.data]);
      setNewIdea({ title: "", description: "" });
      setShowIdeaPopup(false);
      toast.success("Idea created!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "IDEA_CREATED", data: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error("Failed to create idea.");
    }
  };

  const voteIdea = async (ideaId) => {
    try {
      const response = await api.patch(`/api/workspace/${workspaceId}/ideas/${ideaId}/vote`);
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === ideaId ? response.data : idea))
      );
      toast.success("Vote recorded!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "IDEA_UPDATED", data: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error voting on idea:", error);
      toast.error("Failed to vote.");
    }
  };

  const deleteIdea = async (ideaId) => {
    if (!isLeader) {
      toast.error("Only the team leader can delete ideas.");
      return;
    }
    try {
      await api.delete(`/api/workspace/${workspaceId}/ideas/${ideaId}`);
      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
      toast.success("Idea deleted!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "IDEA_DELETED", data: { id: ideaId }, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete idea.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
          Ideas Board
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowIdeaPopup(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle size={16} />
          New Idea
        </motion.button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
        {ideas.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No ideas yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new idea.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                      {idea.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {idea.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Created by: {getUserDisplayName(idea.createdBy)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created: {format(new Date(idea.createdAt), "dd/MM/yyyy hh:mm a")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => voteIdea(idea.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                          idea.voters.includes(currentUser.id)
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        } hover:bg-indigo-500 hover:text-white transition-colors`}
                        disabled={idea.voters.includes(currentUser.id)}
                      >
                        <ThumbsUp size={14} />
                        {idea.votes} {idea.votes === 1 ? "Vote" : "Votes"}
                      </button>
                    </div>
                  </div>
                  {isLeader && (
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Idea Creation Modal */}
      <Dialog
        open={showIdeaPopup}
        onClose={() => setShowIdeaPopup(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Idea</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              label="Idea Title"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="Description"
              value={newIdea.description}
              onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              required
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIdeaPopup(false)}>Cancel</Button>
          <Button
            onClick={handleIdeaSubmit}
            variant="contained"
            color="primary"
            disabled={!newIdea.title || !newIdea.description}
          >
            Create Idea
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IdeasBoard;