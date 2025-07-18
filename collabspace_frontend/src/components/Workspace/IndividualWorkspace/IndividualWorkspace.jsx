import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { Code, Edit3, Layout, Moon, Sun, Folder, HelpCircle } from "lucide-react";

const IndividualDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [lastAccessed, setLastAccessed] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        setWorkspace(response.data);

        // Fetch recent codes (folders)
        const codeResponse = await api.get(`/code/${workspaceId}`);
        console.log("Code response for recent:", codeResponse.data);
        const files = Array.isArray(codeResponse.data?.files) ? codeResponse.data.files : [];
        console.log("Recent files:", files);
        const recentCodes = files
          .filter((file) => file.name && file.name.endsWith("/"))
          .slice(0, 2)
          .map((file) => ({
            id: file.name.replace(/\/$/, ""),
            type: "Code",
            title: file.name.replace(/\/$/, ""),
            content: file.content ? file.content.slice(0, 50) + "..." : "Folder",
            updatedAt: codeResponse.data.createdAt
              ? new Date(codeResponse.data.createdAt)
              : new Date(),
          }));
        console.log("Recent codes:", recentCodes);

        // Fetch recent notes
        const notesResponse = await api.get(`/notes/${workspaceId}/list`);
        const noteNames = notesResponse.data?.slice(0, 2) || [];
        const noteDetails = await Promise.all(
          noteNames.map(async (noteName) => {
            const noteResponse = await api.get(`/notes/${workspaceId}/${noteName}`);
            const content = noteResponse.data?.content
              ? JSON.parse(noteResponse.data.content).ops
                  .map((op) => op.insert)
                  .join("")
                  .slice(0, 50) + "..."
              : "Note";
            return {
              id: noteName,
              type: "Note",
              title: noteName,
              content,
              updatedAt: noteResponse.data.updatedAt
                ? new Date(noteResponse.data.updatedAt)
                : new Date(),
            };
          })
        );

        // Fetch recent whiteboards
        const whiteboardResponse = await api.get(`/whiteboard/${workspaceId}/list`);
        const boardNames = whiteboardResponse.data?.boards?.slice(0, 2) || [];
        const whiteboardDetails = await Promise.all(
          boardNames.map(async (boardName) => {
            const boardResponse = await api.get(`/whiteboard/${workspaceId}/${boardName}`);
            const elementsCount = boardResponse.data?.board?.elements?.length || 0;
            return {
              id: boardName,
              type: "Whiteboard",
              title: boardName,
              content: `${elementsCount} elements`,
              updatedAt: new Date(),
            };
          })
        );

        // Combine and sort recent content
        const recentItems = [...recentCodes, ...noteDetails, ...whiteboardDetails]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 4);

        setRecentContent(recentItems);

        if (recentItems.length > 0) {
          setLastAccessed(recentItems[0]);
        }
      } catch (error) {
        console.error("Error fetching workspace data:", error);
        toast.error("Failed to load workspace data.");
      }
    };
    fetchWorkspace();
  }, [workspaceId]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!workspace)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Loading...</div>
      </div>
    );

  const features = [
    {
      icon: <Code className="w-8 h-8 text-indigo-500" />,
      title: "Code Editor",
      description: "Write and manage your code with a powerful editor.",
      helpText: "Use the Code Editor to write, edit, and run code in various languages. Save and organize your files within the workspace.",
      onClick: () => navigate(`/playground/${workspaceId}/codes`),
    },
    {
      icon: <Edit3 className="w-8 h-8 text-indigo-500" />,
      title: "Notes",
      description: "Capture ideas and keep track of important notes.",
      helpText: "Create and organize notes to jot down ideas, plans, or reminders. Perfect for quick brainstorming or documentation.",
      onClick: () => navigate(`/playground/${workspaceId}/notes`),
    },
    {
      icon: <Layout className="w-8 h-8 text-indigo-500" />,
      title: "Whiteboards",
      description: "Visualize concepts with interactive whiteboards.",
      helpText: "Design diagrams, flowcharts, or sketches on interactive whiteboards. Collaborate and visualize your ideas in real-time.",
      onClick: () => navigate(`/whiteboard-playground/${workspaceId}`),
    },
  ];

  const getNavigationPath = (item) => {
    const isCollaborative = workspace?.type === "group" || workspace?.type === "team";
    switch (item.type) {
      case "Code":
        return { pathname: `/code-editor/${workspaceId}/${item.id}/`, state: { isCollaborative } };
      case "Note":
        return { pathname: `/notepad/${workspaceId}/${item.id}`, state: { isCollaborative } };
      case "Whiteboard":
        return { pathname: `/whiteboard/${workspaceId}/${item.id}`, state: { isCollaborative } };
      default:
        return { pathname: "#", state: {} };
    }
  };

  const formattedType = workspace.type.charAt(0).toUpperCase() + workspace.type.slice(1) + " Workspace";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900" : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"} p-8 transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`${isDarkMode ? "bg-gray-700" : "bg-indigo-100"} p-2 rounded-full`}
            >
              <Folder className="w-8 h-8 text-indigo-500" />
            </motion.div>
            <div>
              <h1 className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"} tracking-tight`}>
                {workspace.workspaceName}
              </h1>
              <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-500"} mt-2 max-w-2xl`}>
                {workspace.workspaceDescription}
              </p>
              <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                {formattedType}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"} p-2 rounded-full shadow-md hover:bg-opacity-80 transition-colors`}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.div>

      {lastAccessed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto mb-8"
        >
          <h2 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} mb-4`}>Start Where You Left Off</h2>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl p-6 cursor-pointer group relative overflow-hidden`}
            onClick={() => navigate(getNavigationPath(lastAccessed).pathname, { state: getNavigationPath(lastAccessed).state })}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-indigo-100"}`}>
                {lastAccessed.type === "Code" ? (
                  <Code className="w-6 h-6 text-indigo-500" />
                ) : lastAccessed.type === "Note" ? (
                  <Edit3 className="w-6 h-6 text-indigo-500" />
                ) : (
                  <Layout className="w-6 h-6 text-indigo-500" />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{lastAccessed.title}</h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"} mt-1`}>{lastAccessed.content}</p>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-400"} mt-1`}>{lastAccessed.type}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden`}
            onClick={feature.onClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {feature.icon}
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{feature.title}</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"} mt-1`}>{feature.description}</p>
                </div>
              </div>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
              >
                <HelpCircle className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <motion.div
                  className={`${isDarkMode ? "bg-gray-700" : "bg-white"} absolute top-8 right-0 w-64 p-4 rounded-lg shadow-lg z-10 hidden group-hover:block`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>{feature.helpText}</p>
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              className="mt-4 h-1 w-0 bg-indigo-500 rounded-full"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <h2 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} mb-4`}>Recent Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {recentContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden`}
                onClick={() => navigate(getNavigationPath(item).pathname, { state: getNavigationPath(item).state })}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300" />
                <div className="relative">
                  <div className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-indigo-100"} w-fit mb-2`}>
                    {item.type === "Code" ? (
                      <Code className="w-5 h-5 text-indigo-500" />
                    ) : item.type === "Note" ? (
                      <Edit3 className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <Layout className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>{item.title}</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"} mt-1 line-clamp-2`}>{item.content}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-400"} mt-2`}>{item.type}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default IndividualDashboard;