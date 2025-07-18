import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Home, CheckCircle, Folder, Users, Settings, Moon, Sun,
  Code, Edit, MessageSquare, Bell, PlusCircle, Layout, Trash2, Eye, Clock, FilePlus, Brain, Kanban, Video
} from "lucide-react";
import CollaborativeEditor from "../../Tools/Collab_editor/collaborative_editor.jsx";
import VideoCall from "../../Tools/VideoCall/VideoCall";
import { useMyContext } from "../../../store/ContextApi";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, FormControl, Button, TextField, Badge, Avatar, Chip, InputLabel
} from "@mui/material";
import { format, isToday, isYesterday } from "date-fns";
import KanbanBoard from "./Kanbanboard.jsx";
import IdeasBoard from "./IdeasBoard.jsx";

const TeamDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentUser, allUsers } = useMyContext();
  const [workspace, setWorkspace] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "", description: "", assignee: "", type: "team", status: "Pending",
    priority: "Medium", dueDate: "", content: ""
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const chatContainerRef = useRef(null);
  const messageIds = useRef(new Set());

  // Theme toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch workspace and team members
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        const workspaceData = response.data;
        setIsLeader(currentUser.id === workspaceData.owner);
        setWorkspace({
          ...workspaceData,
          teamName: workspaceData.workspaceName,
          leader: workspaceData.owner
        });
        setTeamMembers(workspaceData.participants.map(email => ({
          id: email,
          email,
          username: email.split("@")[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=6366f1&color=fff`,
          accountNonLocked: true,
          twoFactorEnabled: false
        })) || []);
        setPermissions(workspaceData.permissions || {});
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace.");
      }
    };
    fetchWorkspace();
  }, [workspaceId, currentUser]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get(`/api/workspace/${workspaceId}/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks.");
      }
    };
    fetchTasks();
  }, [workspaceId]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await api.get(`/api/chat/${workspaceId}`);
        const messages = response.data || [];

        setChatMessages(messages);
        messageIds.current = new Set(messages.map(msg => msg.id));
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Failed to load chat history.");
      }
    };
    fetchChatHistory();
  }, [workspaceId]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/api/workspace/${workspaceId}/notifications`);
        setNotifications(response.data.filter(notif => notif.createdBy !== currentUser?.id));
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications.");
      }
    };
    fetchNotifications();
  }, [workspaceId, currentUser?.id]);

  // WebSocket setup
  useEffect(() => {
    if (!workspace || workspace.type !== "team") return;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket(`ws://192.168.231.184:8080/ws/team/${workspaceId}`);
      wsRef.current.onopen = () => {
        console.log("Team WebSocket connected for workspace:", workspaceId);
        reconnectAttempts.current = 0;
        toast.success("Real-time collaboration enabled!");
      };
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case "CHAT_MESSAGE":
              if (!messageIds.current.has(message.data.id)) {
                messageIds.current.add(message.data.id);
                setChatMessages((prev) => [...prev, message.data]);
                if (activeMenu !== "chat") setNewMessagesCount((prev) => prev + 1);
              }
              break;
            case "TASK_CREATED":
              setTasks((prev) => [...prev, message.data]);
              break;
            case "TASK_UPDATED":
              setTasks((prev) =>
                prev.map((task) => (task.id === message.data.id ? message.data : task))
              );
              break;
            case "TASK_DELETED":
              setTasks((prev) => prev.filter((task) => task.id !== message.data.id));
              break;
            case "NOTIFICATION":
              if (message.notification.createdBy !== currentUser.id) {
                setNotifications((prev) => [message.notification, ...prev]);
                if (!showNotifications) setNewNotificationsCount((prev) => prev + 1);
              }
              break;
            case "MEMBER_ADDED":
              setTeamMembers((prev) => [...prev, message.data]);
              toast.success("New team member added!");
              break;
            case "MEMBER_REMOVED":
              setTeamMembers((prev) => prev.filter((m) => m.email !== message.data));
              toast.success("Team member removed!");
              break;
            case "PERMISSION_UPDATE":
              setPermissions(message.data);
              toast.success("Permissions updated!");
              break;
            case "IDEA_CREATED":
              setIdeas((prev) => [...prev, message.data]);
              break;
            case "IDEA_UPDATED":
              setIdeas((prev) =>
                prev.map((idea) => (idea.id === message.data.id ? message.data : idea))
              );
              break;
            case "IDEA_DELETED":
              setIdeas((prev) => prev.filter((idea) => idea.id !== message.data.id));
              break;
            case "KANBAN_UPDATED":
              setTasks((prev) =>
                prev.map((task) => (task.id === message.data.id ? message.data : task))
              );
              break;
            default:
              console.log("Unhandled WebSocket message:", message);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      wsRef.current.onclose = () => {
        console.log("Team WebSocket disconnected");
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
        console.error("Team WebSocket error:", error);
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
  }, [workspace, workspaceId, currentUser?.id, activeMenu, showNotifications]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Reset message count
  useEffect(() => {
    if (activeMenu === "chat") setNewMessagesCount(0);
  }, [activeMenu]);

  // Reset notification count
  useEffect(() => {
    if (showNotifications) setNewNotificationsCount(0);
  }, [showNotifications]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleTaskSubmit = async () => {
    if (!isLeader) {
      toast.error("Only the team leader can assign tasks.");
      return;
    }
    if (!newTask.title.trim() || !newTask.description.trim()) {
      return toast.error("Title and description are required.");
    }
    if (newTask.type !== "team" && !newTask.assignee) {
      return toast.error("Assignee is required for individual tasks.");
    }

    const taskPayload = {
      ...newTask,
      workspaceId,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null
    };

    try {
      const response = await api.post(`/api/workspace/${workspaceId}/tasks`, taskPayload);
      setTasks((prev) => [...prev, response.data]);
      setNewTask({
        title: "", description: "", assignee: "", type: "team", status: "Pending",
        priority: "Medium", dueDate: "", content: ""
      });
      setShowTaskPopup(false);
      toast.success("Task created!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "TASK_CREATED", data: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task.");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`/api/workspace/${workspaceId}/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data : task))
      );
      toast.success("Task status updated!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "TASK_UPDATED", data: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status.");
    }
  };

  const deleteTask = async (taskId) => {
    if (!isLeader) {
      toast.error("Only the team leader can delete tasks.");
      return;
    }
    try {
      await api.delete(`/api/workspace/${workspaceId}/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success("Task deleted!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "TASK_DELETED", data: { id: taskId }, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  const updateMemberPermission = async (userId, permission) => {
    if (!isLeader) {
      toast.error("Only the team leader can update permissions.");
      return;
    }
    try {
      const updatedPermissions = { ...permissions, [userId]: permission };
      await api.post(`/workspace/${workspaceId}/permissions`, updatedPermissions);
      setPermissions(updatedPermissions);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "PERMISSION_UPDATE", data: updatedPermissions, workspaceId })
        );
      }
      toast.success(`Permission for user updated!`);
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions.");
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    const message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.username,
      content: newMessage,
      timestamp: new Date().toISOString(),
      workspaceId
    };
    try {
      const response = await api.post(`/api/chat/${workspaceId}`, message);
      console.log(getUserById(workspace.owner));
      if (!messageIds.current.has(message.id)) {
        messageIds.current.add(message.id);
        setChatMessages((prev) => [...prev, response.data]);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: "CHAT_MESSAGE", data: response.data, workspaceId })
          );
        }
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending chat message:", error);
      toast.error("Failed to send message.");
    }
  };

  const sendNotification = async () => {
    if (!isLeader) {
      toast.error("Only the team leader can send notifications.");
      return;
    }
    const notification = {
      id: Date.now().toString(),
      message: `Notification from ${currentUser.username}`,
      createdBy: currentUser.id,
      timestamp: new Date().toISOString()
    };
    try {
      await api.post(`/api/workspace/${workspaceId}/notifications`, notification);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "NOTIFICATION", notification, workspaceId })
        );
      }
      toast.success("Notification sent to team!");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification.");
    }
  };

  const groupMessagesByDate = () => {
    const grouped = {};
    chatMessages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const dateKey = isToday(date)
        ? "Today"
        : isYesterday(date)
          ? "Yesterday"
          : format(date, "MM/dd/yyyy");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(msg);
    });
    return grouped;
  };

  const getUserDisplayName = (userId) => {
    const user = teamMembers.find(m => m.id === userId);
    return userId === currentUser.id ? "You" : user?.username || userId;
  };

  const getUserById = (userId) => {
    return allUsers.find((u) => u.userId === userId) || { username: userId, email: "N/A" };
  };



  const getUserByEmail = (email) => {
    if (!email) {
      return {
        username: email,
        email: "unknown",
        avatar: `https://ui-avatars.com/api/?name=Unknown&background=6366f1&color=fff`,
        accountNonLocked: false,
        twoFactorEnabled: false
      };
    }
    const user = teamMembers.find(m => m.email === email);
    return user || {
      username: email.split("@")[0],
      email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=6366f1&color=fff`,
      accountNonLocked: false,
      twoFactorEnabled: false
    };
  };

  const assignedTasks = tasks.filter(task =>
    task.type === "team" || task.assignee === currentUser?.email
  );

  const tools = [
    {
      icon: <Code className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Code Editor",
      helpText: "Write, edit, and run code in various languages.",
      onClick: () => navigate(`/playground/${workspaceId}/codes`)
    },
    {
      icon: <Edit className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Notes",
      helpText: "Create and organize notes for brainstorming or documentation.",
      onClick: () => navigate(`/playground/${workspaceId}/notes`)
    },
    {
      icon: <Layout className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Whiteboard",
      helpText: "Design diagrams or sketches on interactive whiteboards.",
      onClick: () => navigate(`/whiteboard-playground/${workspaceId}`)
    },
    {
      icon: <Brain className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Ideas Board",
      helpText: "Collaboratively brainstorm and vote on ideas.",
      onClick: () => setActiveMenu("ideas")
    },
    {
      icon: <Code className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Collaborative Editor",
      helpText: "Real-time collaborative document editing.",
      onClick: () => setActiveMenu("collaborative-editor")
    },
    {
      icon: <Kanban className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />,
      title: "Kanban Board",
      helpText: "Visualize and manage tasks with a Kanban board.",
      onClick: () => setActiveMenu("kanban")
    }
  ];

  if (!workspace || !currentUser || !teamMembers.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-indigo-900 dark:to-purple-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gradient-to-br from-indigo-900 to-purple-900 text-white" : "bg-gray-50 text-gray-900"} overflow-hidden font-sans`}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-64 ${isDarkMode ? "bg-gradient-to-b from-gray-800/95 to-indigo-900/95" : "bg-white/95"} backdrop-blur-lg shadow-2xl z-20 fixed h-full lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold tracking-tight">{workspace.teamName}</h2>
          <button onClick={toggleSidebar} className="hover:text-indigo-500 lg:hidden">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "tasks", label: "Tasks", icon: CheckCircle },
            { id: "team", label: "Team", icon: Users },
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "video-call", label: "Video Call", icon: Video },
            { id: "tools", label: "Tools", icon: Folder },
            { id: "ideas", label: "Ideas Board", icon: Brain },
            { id: "collaborative-editor", label: "Collaborative Editor", icon: Code },
            { id: "kanban", label: "Kanban Board", icon: Kanban },
            { id: "settings", label: "Settings", icon: Settings }
          ].map(menu => (
            <div key={menu.id}>
              <motion.button
                onClick={() => setActiveMenu(menu.id)}
                whileHover={{ x: 5, backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb" }}
                className={`flex items-center w-full p-3 rounded-lg transition-colors text-left ${activeMenu === menu.id ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-200" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {menu.id === "chat" ? (
                  <div className="relative">
                    <menu.icon size={20} className="mr-3" />
                    {newMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {newMessagesCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <menu.icon size={20} className="mr-3" />
                )}
                {menu.label}
              </motion.button>
              {menu.id === "tools" && activeMenu === "tools" && (
                <div className="pl-8 space-y-1 mt-2">
                  {tools.map(tool => (
                    <motion.button
                      key={tool.title}
                      whileHover={{ x: 5 }}
                      onClick={tool.onClick}
                      className="flex items-center w-full p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      {tool.icon}
                      <span className="ml-2">{tool.title}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`p-4 flex items-center justify-between ${isDarkMode ? "bg-gradient-to-r from-gray-800 to-indigo-900" : "bg-gradient-to-r from-white to-gray-100"} shadow-md`}>
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="mr-4 hover:text-indigo-500 lg:hidden">
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight">{workspace.teamName}</h1>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-200 rounded-full text-sm font-medium"
              >
                Team
              </motion.span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-4 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium"
            >
              Leader: {currentUser?.id === workspace.owner ? "You" : getUserById(workspace.owner).userName}
            </motion.span>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell size={24} />
                {newNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {newNotificationsCount}
                  </span>
                )}
              </motion.button>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 z-10 border dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    Notifications
                  </h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No new notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((notif, index) => (
                      <div
                        key={`${notif.id}-${index}`}
                        className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {format(new Date(notif.timestamp), "dd/MM/yyyy hh:mm a")}
                        </p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </motion.button>
            {isLeader && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsPermissionsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Manage Permissions
              </motion.button>
            )}
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=6366f1&color=fff&size=40`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-500"
              />
              <span className="text-gray-900 dark:text-white font-medium">{currentUser.username}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl p-8 ${isDarkMode ? "bg-gradient-to-br from-gray-800/95 to-indigo-900/95" : "bg-white/95"} backdrop-blur-lg shadow-xl`}
          >
            {activeMenu === "dashboard" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Team Members</h3>
                      <Users className="text-indigo-500 dark:text-indigo-300" />
                    </div>
                    <p className="text-3xl font-bold mt-2">{teamMembers.length}</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Active Tasks</h3>
                      <CheckCircle className="text-indigo-500 dark:text-indigo-300" />
                    </div>
                    <p className="text-3xl font-bold mt-2">{tasks.filter(t => t.status !== "Completed").length}</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Your Tasks</h3>
                      <CheckCircle className="text-indigo-500 dark:text-indigo-300" />
                    </div>
                    <p className="text-3xl font-bold mt-2">{assignedTasks.length}</p>
                  </motion.div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Tasks</h3>
                    {isLeader && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTaskPopup(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <PlusCircle size={16} />
                        New Task
                      </motion.button>
                    )}
                  </div>
                  {assignedTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedTasks.slice(0, 4).map(task => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                          className={`p-5 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" :
                                      task.priority === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200" :
                                        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                    }`}
                                >
                                  {task.priority}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Status: {task.status}
                                </span>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Clock size={14} className="mr-1" />
                                  Due: {format(new Date(task.dueDate), "dd/MM/yyyy hh:mm a")}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (task.type === "code") {
                                    navigate(`/playground/${workspaceId}/codes`);
                                  } else if (task.type === "notes") {
                                    navigate(`/playground/${workspaceId}/notes`);
                                  } else if (task.type === "whiteboard") {
                                    navigate(`/whiteboard-playground/${workspaceId}`);
                                  } else if (task.type === "ideas") {
                                    setActiveMenu("ideas");
                                  } else if (task.type === "collaborative-editor") {
                                    setActiveMenu("collaborative-editor");
                                  } else if (task.type === "kanban") {
                                    setActiveMenu("kanban");
                                  } else if (task.type === "video-call") {
                                    setActiveMenu("video-call");
                                  }
                                }}
                                className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                              >
                                <Eye size={18} />
                              </button>
                              {isLeader && (
                                <>
                                  <button
                                    onClick={() => {
                                      setNewTask({ ...task, type: task.type || "team" });
                                      setShowTaskPopup(true);
                                    }}
                                    className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-8 text-center rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <FilePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No tasks assigned</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {isLeader ? "Create a new task to get started" : "You don't have any assigned tasks yet"}
                      </p>
                      {isLeader && (
                        <div className="mt-6">
                          <button
                            onClick={() => setShowTaskPopup(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            New Task
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === "tasks" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold tracking-tight">Task Management</h2>
                  {isLeader && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTaskPopup(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <PlusCircle size={16} />
                      New Task
                    </motion.button>
                  )}
                </div>
                {isLeader ? (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                    <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                      All Assigned Tasks
                    </h3>
                    {tasks.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">No tasks assigned.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task, index) => (
                          <div
                            key={`${task.id}-${index}`}
                            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                                  {task.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <img
                                    src={`https://ui-avatars.com/api/?name=${task.assignee || 'Team'}&background=6366f1&color=fff&size=24`}
                                    alt="Assignee avatar"
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Assigned To: {task.type === "team" ? "Team" : getUserDisplayName(task.assignee)}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Due: {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy hh:mm a") : "N/A"}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Status: <span className={`capitalize ${task.status === 'Completed' ? 'text-green-600 dark:text-green-300' : task.status === 'In Progress' ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>{task.status}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Priority: {task.priority}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (task.type === "code") {
                                      navigate(`/playground/${workspaceId}/codes`);
                                    } else if (task.type === "notes") {
                                      navigate(`/playground/${workspaceId}/notes`);
                                    } else if (task.type === "whiteboard") {
                                      navigate(`/whiteboard-playground/${workspaceId}`);
                                    } else if (task.type === "ideas") {
                                      setActiveMenu("ideas");
                                    } else if (task.type === "collaborative-editor") {
                                      setActiveMenu("collaborative-editor");
                                    } else if (task.type === "kanban") {
                                      setActiveMenu("kanban");
                                    } else if (task.type === "video-call") {
                                      setActiveMenu("video-call");
                                    }
                                  }}
                                  className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                  title="View"
                                >
                                  <Eye size={20} />
                                </button>
                                {isLeader && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setNewTask({ ...task, type: task.type || "team" });
                                        setShowTaskPopup(true);
                                      }}
                                      className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                      title="Edit"
                                    >
                                      <Edit size={20} />
                                    </button>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
                                      title="Delete"
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Update Status
                              </label>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                    <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                      Your Assigned Tasks
                    </h3>
                    {assignedTasks.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">No tasks assigned to you.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignedTasks.map((task, index) => (
                          <div
                            key={`${task.id}-${index}`}
                            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                                  {task.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Due: {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy hh:mm a") : "N/A"}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Status: <span className={`capitalize ${task.status === 'Completed' ? 'text-green-600 dark:text-green-300' : task.status === 'In Progress' ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>{task.status}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Priority: {task.priority}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (task.type === "code") {
                                      navigate(`/playground/${workspaceId}/codes`);
                                    } else if (task.type === "notes") {
                                      navigate(`/playground/${workspaceId}/notes`);
                                    } else if (task.type === "whiteboard") {
                                      navigate(`/whiteboard-playground/${workspaceId}`);
                                    } else if (task.type === "ideas") {
                                      setActiveMenu("ideas");
                                    } else if (task.type === "collaborative-editor") {
                                      setActiveMenu("collaborative-editor");
                                    } else if (task.type === "kanban") {
                                      setActiveMenu("kanban");
                                    } else if (task.type === "video-call") {
                                      setActiveMenu("video-call");
                                    }
                                  }}
                                  className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                  title="View"
                                >
                                  <Eye size={20} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Update Status
                              </label>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeMenu === "team" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                  Team Members
                </h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                  <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                    Leader
                  </h3>
                  <div className="flex items-center gap-4 mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <img
                      src={getUserByEmail(getUserById(workspace.owner).email).avatar}
                      alt="Leader Avatar"
                      className="w-10 h-10 rounded-full border-2 border-indigo-500"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {getUserById(workspace.owner).username}
                        {workspace.owner === currentUser.id && (
                          <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {getUserById(workspace.owner).userName}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                          Leader
                        </span>
                        {getUserByEmail(workspace.owner).accountNonLocked && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                        {getUserByEmail(workspace.owner).twoFactorEnabled && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                            2FA Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                    Members
                  </h3>
                  {teamMembers.length > 0 ? (
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.email}
                          className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        >
                          <img
                            src={member.avatar}
                            alt="Member Avatar"
                            className="w-10 h-10 rounded-full border-2 border-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {member.username}
                              {member.email === currentUser.email && (
                                <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{member.email}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {member.accountNonLocked ? (
                                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="text-xs bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
                                  Locked
                                </span>
                              )}
                              {member.twoFactorEnabled && (
                                <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                                  2FA Enabled
                                </span>
                              )}
                              <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 px-2 py-1 rounded-full">
                                {permissions[member.email] || "View"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No members yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeMenu === "chat" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                  Team Chat
                </h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col h-[calc(100vh-12rem)]">
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    {Object.entries(groupMessagesByDate()).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="text-center my-4">
                          <span className="inline-block bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
                            {date}
                          </span>
                        </div>
                        {msgs.map((msg, index) => (
                          <div
                            key={`${msg.id}-${date}-${index}`}
                            className={`mb-3 flex ${msg.sender === currentUser.username ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div
                              className={`max-w-xs p-3 rounded-lg flex items-start gap-2 shadow-sm ${msg.sender === currentUser.username
                                  ? "bg-green-200 dark:bg-slate-600 text-gray-900 dark:text-white"
                                  : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                                }`}
                            >
                              <img
                                src={`https://ui-avatars.com/api/?name=${getUserById(msg.sender).username}&background=6366f1&color=fff&size=32`}
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-semibold">{getUserById(msg.sender).username}</p>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs text-gray-400 mt-1 text-right">
                                  {format(new Date(msg.timestamp), "dd/MM/yyyy hh:mm:ss a")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    />
                    <button
                      onClick={sendChatMessage}
                      className="ml-2 bg-indigo-600 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "video-call" && (
              <VideoCall
                workspace={workspace}
                isOwner={currentUser.email === workspace.owner}
                currentUser={currentUser}
                getUserDisplayName={getUserDisplayName}
              />
            )}

            {activeMenu === "ideas" && (
              <IdeasBoard
                workspaceId={workspaceId}
                currentUser={currentUser}
                isLeader={isLeader}
                ideas={ideas}
                setIdeas={setIdeas}
                wsRef={wsRef}
                getUserDisplayName={getUserDisplayName}
              />
            )}

            {activeMenu === "collaborative-editor" && (
              <CollaborativeEditor
                workspaceId={workspaceId}
                currentUser={currentUser}
                isLeader={isLeader}
              />
            )}

            {activeMenu === "kanban" && (
              <KanbanBoard
                workspaceId={workspaceId}
                currentUser={currentUser}
                isLeader={isLeader}
                tasks={tasks}
                setTasks={setTasks}
                teamMembers={teamMembers}
                wsRef={wsRef}
              />
            )}

            {activeMenu === "settings" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold tracking-tight">Workspace Settings</h2>
                <div className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} shadow-lg`}>
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Workspace Name</label>
                      <input
                        type="text"
                        value={workspace.teamName}
                        readOnly
                        className={`w-full p-3 rounded-lg border ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Workspace Description</label>
                      <textarea
                        value={workspace.description || "No description provided"}
                        readOnly
                        className={`w-full p-3 rounded-lg border ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"}`}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium mb-1">Dark Mode</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Task Creation Modal */}
      <Dialog
        open={showTaskPopup}
        onClose={() => setShowTaskPopup(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{newTask.id ? "Update Task" : "Create New Task"}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value, assignee: e.target.value === "team" ? "" : newTask.assignee })}
                label="Task Type"
              >
                <MenuItem value="team">Team Task</MenuItem>
                <MenuItem value="code">Code</MenuItem>
                <MenuItem value="notes">Notes</MenuItem>
                <MenuItem value="whiteboard">Whiteboard</MenuItem>
                <MenuItem value="ideas">Ideas Board</MenuItem>
                <MenuItem value="collaborative-editor">Collaborative Editor</MenuItem>
                <MenuItem value="kanban">Kanban Board</MenuItem>
                <MenuItem value="video-call">Video Call</MenuItem>
              </Select>
            </FormControl>
            {newTask.type !== "team" && (
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <div className="max-h-40 overflow-y-auto bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-2">
                  {teamMembers.map(member => (
                    <label
                      key={member.email}
                      className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="assignee"
                        value={member.email}
                        checked={newTask.assignee === member.email}
                        onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                        className="form-radio text-indigo-600 dark:text-indigo-300 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                      />
                      <img
                        src={member.avatar}
                        alt={`${member.username} avatar`}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{member.email}</span>
                    </label>
                  ))}
                </div>
              </FormControl>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Due Date"
                type="datetime-local"
                value={newTask.dueDate ? new Date(new Date(newTask.dueDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const localDate = e.target.value ? new Date(e.target.value).toISOString() : "";
                  setNewTask({ ...newTask, dueDate: localDate });
                }}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <TextField
              label="Content (Optional)"
              value={newTask.content}
              onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTaskPopup(false)}>Cancel</Button>
          <Button
            onClick={handleTaskSubmit}
            variant="contained"
            color="primary"
            disabled={!newTask.title || !newTask.description || (newTask.type !== "team" && !newTask.assignee)}
          >
            {newTask.id ? "Update Task" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Modal */}
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
                  <TableCell>Member</TableCell>
                  <TableCell>Current Permission</TableCell>
                  <TableCell>Change Permission</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.email}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar src={member.avatar} alt={member.username} sx={{ width: 32, height: 32 }} />
                        <div>
                          <div>{member.username}</div>
                          <div className="text-xs text-gray-500">{member.email === workspace.owner ? "Leader" : "Member"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permissions[member.email] || "View"}
                        color={permissions[member.email] === "Edit" ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={permissions[member.email] || "View"}
                          onChange={(e) => updateMemberPermission(member.email, e.target.value)}
                          disabled={member.email === workspace.owner}
                        >
                          <MenuItem value="View">View</MenuItem>
                          <MenuItem value="Edit">Edit</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPermissionsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeamDashboard;