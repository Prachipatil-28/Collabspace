import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useMyContext } from "../../../store/ContextApi";

const Playground = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [workspace, setWorkspace] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { currentUser } = useMyContext();

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        const workspaceData = response.data;
        setWorkspace(workspaceData);
        setIsOwner(currentUser?.id === workspaceData.owner);
        setIsMember(workspaceData?.participants?.includes(currentUser?.email));
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace data.");
      }
    };

    const fetchItems = async () => {
      try {
        const response = await api.get(`/code/${workspaceId}`);
        const project = response.data || {};
        const files = Array.isArray(project.files) ? project.files : [];
        const folders = files.filter((f) => f.name && f.name.endsWith("/"));
        setItems(
          folders.map((folder) => ({
            name: folder.name.replace(/\/$/, ""),
            owner: project.owner,
            createdAt: project.createdAt
              ? new Date(project.createdAt).toLocaleString()
              : new Date().toLocaleString(),
            description: folder.content || "No description",
          }))
        );
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Failed to load folders. Please try again.");
      }
    };

    fetchWorkspace();
    fetchItems();
  }, [workspaceId, currentUser]);

  const handleCardClick = (item) => {
    const isCollaborative =
      (workspace?.type === "group" || workspace?.type === "team") &&
      workspace.owner === currentUser.id;
    navigate(`/code-editor/${workspaceId}/${item.name}/`, { state: { isCollaborative } });
  };

  const handleCreateItem = async () => {
    if (!isOwner && !isMember) {
      toast.error("Only the workspace owner and participants can create folders.");
      return;
    }
    if (!newName) {
      toast.error("Folder name is required.");
      return;
    }
    const trimmedName = newName.trim();
    if (!/^[a-zA-Z0-9_-][a-zA-Z0-9_\s-]*$/.test(trimmedName)) {
      toast.error(
        "Folder name can only contain letters, numbers, underscores, hyphens, or spaces (must start with letter, number, underscore, or hyphen)."
      );
      return;
    }
    try {
      const response = await api.get(`/code/${workspaceId}`);
      const project = response.data || {};
      const existingFiles = Array.isArray(project.files) ? project.files : [];

      const folderName = `${trimmedName}/`;
      if (existingFiles.some((f) => f.name === folderName)) {
        toast.error("A folder with this name already exists.");
        return;
      }

      const newFolder = { name: folderName, content: newDescription };
      const payload = {
        workspaceId,
        files: [...existingFiles, newFolder],
        code: "",
        language: "javascript",
        owner: currentUser.id, // Always set to currentUser.id for new project
        createdAt: new Date().toISOString(),
      };

      const savedProject = await api.post("/code/save", payload);

      setItems([
        ...items,
        {
          name: trimmedName,
          owner: savedProject.data.owner,
          createdAt: savedProject.data?.createdAt
            ? new Date(savedProject.data.createdAt).toLocaleString()
            : new Date().toLocaleString(),
          description: newDescription,
        },
      ]);

      toast.success("Folder created successfully!");
      const isCollaborative =
        (workspace?.type === "group" || workspace?.type === "team") &&
        workspace.owner === currentUser.id;
      navigate(`/code-editor/${workspaceId}/${trimmedName}/`, { state: { isCollaborative } });
      setNewName("");
      setNewDescription("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(error.response?.data?.error || "Failed to create folder. Please try again.");
    }
  };

  const handleCancelCreate = () => {
    setNewName("");
    setNewDescription("");
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(`/dashboard/individual/${workspaceId}`)}
          className="mr-4 p-2 text-blue-700 hover:text-blue-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-blue-900 flex-grow">Code Playground</h1>
        {(isOwner || isMember) && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 mr-2 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Folder
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length > 0 ? (
          items.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleCardClick(item)}
              >
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-700 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 0 00-2 2z"
                      />
                    </svg>
                    <h2 className="text-lg font-bold text-blue-900">{item.name}</h2>
                  </div>
                  <p className="text-sm font-semibold text-green-700">Owner: {item.owner}</p>
                  <p className="text-sm font-semibold text-pink-700">Created: {item.createdAt}</p>
                  <p className="text-sm text-blue-700 mt-2">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No folders available. Create one to get started!
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-700 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 0 00-2 2z"
                />
              </svg>
              Create New Folder
            </h2>
            <input
              type="text"
              placeholder="Folder Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
              rows="3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelCreate}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900"
              >
                Create & Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playground;