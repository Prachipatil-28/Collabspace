import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { format, isToday, isYesterday } from "date-fns";
import {
  Users,
  MessageSquare,
  Bell,
  PlusCircle,
  LayoutDashboard,
  Code,
  Edit3,
  Layout,
  HelpCircle,
  Trash2,
  Eye,
  Video,
  Sun,
  Moon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMyContext } from "../../../store/ContextApi";
import VideoCall from "../../Tools/VideoCall/VideoCall";

const GroupDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useMyContext();
  const [workspace, setWorkspace] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    assignedTo: "",
    type: "code",
    content: "",
    status: "pending",
    remarks: "",
  });
  const [newNotification, setNewNotification] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const wsRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageIds = useRef(new Set());

  // Theme toggle logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const maxRetries = 5;
  let retryCount = 0;

  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();
    wsRef.current = new WebSocket(`ws://192.168.231.184:8080/ws/workspace/${workspaceId}`);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      retryCount = 0;
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);
      switch (data.type) {
        case "CHAT_MESSAGE":
          if (!messageIds.current.has(data.data.id)) {
            messageIds.current.add(data.data.id);
            setMessages((prev) => [...prev, data.data]);
            if (activeTab !== "chat") setNewMessagesCount((prev) => prev + 1);
          }
          break;
        case "TASK_CREATED":
          setTasks((prev) => [...prev, data.data]);
          break;
        case "TASK_UPDATED":
          setTasks((prev) =>
            prev.map((task) => (task.id === data.data.id ? data.data : task))
          );
          break;
        case "TASK_DELETED":
          setTasks((prev) => prev.filter((task) => task.id !== data.data.id));
          break;
        case "NOTIFICATION":
          if (data.notification.createdBy !== currentUser.id) {
            setNotifications((prev) => [data.notification, ...prev]);
            if (!showNotifications) setNewNotificationsCount((prev) => prev + 1);
          }
          break;
        case "MEMBER_ADDED":
          setWorkspace((prev) => ({
            ...prev,
            participants: data.data.participants,
          }));
          break;
      }
    };

    wsRef.current.onerror = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(connectWebSocket, 2000 * retryCount);
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
  };

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        console.log("Workspace:", response.data);
        setWorkspace(response.data);
        setIsOwner(response.data.owner === currentUser.id);
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace.");
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await api.get(`/api/workspace/${workspaceId}/tasks`);
        console.log("Tasks:", response.data);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks.");
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/chat/${workspaceId}`);
        console.log("Messages:", response.data);
        setMessages(response.data);
        messageIds.current = new Set(response.data.map((msg) => msg.id));
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages.");
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/api/workspace/${workspaceId}/notifications`);
        console.log("Notifications:", response.data);
        setNotifications(
          response.data.filter((notif) => notif.createdBy !== currentUser.id)
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications.");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await api.get(`/users/all`);
        console.log("Users:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };

    if (currentUser?.id) {
      fetchWorkspace();
      fetchTasks();
      fetchMessages();
      fetchNotifications();
      fetchUsers();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [workspaceId, currentUser?.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeTab === "chat") setNewMessagesCount(0);
  }, [activeTab]);

  useEffect(() => {
    if (showNotifications) setNewNotificationsCount(0);
  }, [showNotifications]);

  const handleCreateTask = async () => {
    if (!isOwner) return toast.error("Only the owner can create tasks.");
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.assignedTo.trim()) {
      return toast.error("Title, description, and assigned user are required.");
    }
    if (!workspace?.participants.includes(newTask.assignedTo)) {
      return toast.error("Assigned user must be a participant.");
    }
    try {
      const taskPayload = {
        ...newTask,
        workspaceId,
        createdBy: currentUser.id,
        startDate: newTask.startDate ? new Date(newTask.startDate).toISOString() : null,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
      };
      const response = await api.post(`/api/workspace/${workspaceId}/tasks`, taskPayload);
      setTasks((prev) => [...prev, response.data]);
      setNewTask({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        assignedTo: "",
        type: "code",
        content: "",
        status: "pending",
        remarks: "",
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

  const handleUpdateTask = async (taskId, updates) => {
    if (!isOwner) {
      return toast.error("Only the owner can update tasks.");
    }
    try {
      const response = await api.patch(`/api/workspace/${workspaceId}/tasks/${taskId}`, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data : task))
      );
      toast.success("Task updated!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "TASK_UPDATED", data: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  const handleNotifyOwner = async (task) => {
    if (isOwner) return;
    try {
      const notificationPayload = {
        message: `Task "${task.title}" marked as completed by ${currentUser.email}`,
        workspaceId,
        createdBy: currentUser.id,
      };
      const response = await api.post(`/api/workspace/${workspaceId}/notifications`, notificationPayload);
      toast.success("Owner notified of task completion!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "NOTIFICATION", notification: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error notifying owner:", error);
      toast.error("Failed to notify owner.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isOwner) return toast.error("Only the owner can delete tasks.");
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return toast.error("Message cannot be empty.");
    try {
      const messagePayload = {
        content: newMessage,
        sender: currentUser.id,
        workspaceId,
      };
      const response = await api.post(`/api/chat/${workspaceId}`, messagePayload);
      if (!messageIds.current.has(response.data.id)) {
        messageIds.current.add(response.data.id);
        setMessages((prev) => [...prev, response.data]);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: "CHAT_MESSAGE", data: response.data, workspaceId })
          );
        }
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
    }
  };

  const handleSendNotification = async () => {
    if (!isOwner) return toast.error("Only the owner can send notifications.");
    if (!newNotification.trim()) return toast.error("Notification cannot be empty.");
    try {
      const notificationPayload = {
        message: newNotification,
        workspaceId,
        createdBy: currentUser.id,
      };
      const response = await api.post(`/api/workspace/${workspaceId}/notifications`, notificationPayload);
      setNewNotification("");
      setShowNotificationPopup(false);
      toast.success("Notification sent!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "NOTIFICATION", notification: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification.");
    }
  };

  const getUserById = (userId) => {
    return users.find((u) => u.userId === userId) || { username: userId, email: "N/A" };
  };

  const getUserByEmail = (email) => {
    const user = users.find((u) => u.email === email);
    return user || {
      username: email.split("@")[0],
      email: email,
      profileImage: null,
      accountNonLocked: false,
      twoFactorEnabled: false,
    };
  };

  const getUserDisplayName = (email) => {
    const user = getUserByEmail(email);
    return email === currentUser.email ? "You" : user.username || email.split("@")[0];
  };

  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach((msg) => {
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

  const assignedTasks = tasks.filter((task) => task.assignedTo === currentUser.email);

  const tools = [
    {
      icon: <Code className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />,
      title: "Code Editor",
      description: "Write and manage code collaboratively.",
      helpText: "Use the Code Editor to write, edit, and run code in various languages.",
      onClick: () => navigate(`/playground/${workspaceId}/codes`),
    },
    {
      icon: <Edit3 className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />,
      title: "Notes",
      description: "Capture ideas and keep track of notes.",
      helpText: "Create and organize notes for brainstorming or documentation.",
      onClick: () => navigate(`/playground/${workspaceId}/notes`),
    },
    {
      icon: <Layout className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />,
      title: "Whiteboard",
      description: "Visualize concepts with interactive whiteboards.",
      helpText: "Design diagrams or sketches on interactive whiteboards.",
      onClick: () => navigate(`/whiteboard-playground/${workspaceId}`),
    },
  ];

  const recentContent = [
    {
      id: "projectx",
      type: "Code",
      title: "ProjectX.js",
      content: "JavaScript project folder...",
      updatedAt: new Date(),
    },
    {
      id: "note1",
      type: "Note",
      title: "Meeting Notes",
      content: "Notes from team meeting...",
      updatedAt: new Date(),
    },
    {
      id: "diagram1",
      type: "Whiteboard",
      title: "Flowchart",
      content: "5 elements",
      updatedAt: new Date(),
    },
  ];

  if (!workspace || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gradient-to-br dark:from-indigo-900 dark:to-purple-900 text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 dark:border-indigo-300"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gradient-to-br dark:from-indigo-900 dark:to-purple-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 p-4 flex flex-col shadow-xl rounded-r-xl">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-6 flex items-center gap-2">
          <LayoutDashboard size={24} /> {workspace.workspaceName}
        </h2>
        <nav className="flex-1">
          {["dashboard", "members", "chat", "tools", "video-call"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center p-2 mb-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 dark:bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab === "dashboard" && <LayoutDashboard size={20} className="mr-2" />}
              {tab === "members" && <Users size={20} className="mr-2" />}
              {tab === "chat" && (
                <div className="relative">
                  <MessageSquare size={20} className="mr-2" />
                  {newMessagesCount > 0 && (
                    <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {newMessagesCount}
                    </span>
                  )}
                </div>
              )}
              {tab === "tools" && <Code size={20} className="mr-2" />}
              {tab === "video-call" && <Video size={20} className="mr-2" />}
              {tab === "video-call" ? "Video Call" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-4 flex items-center justify-between shadow-xl">
          <h1 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
            {workspace.workspaceName} Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-gray-600 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                <Bell size={24} />
                {newNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {newNotificationsCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 z-10 border dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    Notifications
                  </h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No new notifications</p>
                  ) : (
                    notifications.map((notif, index) => (
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
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=6366f1&color=fff&size=40`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-500"
              />
              <span className="text-gray-900 dark:text-white font-medium">
                {currentUser.username}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                Dashboard
              </h2>
              {isOwner ? (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setShowTaskPopup(true)}
                      className="bg-indigo-600 dark:bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <PlusCircle size={20} className="mr-2" />
                      Create New Task
                    </button>
                    <button
                      onClick={() => setShowNotificationPopup(true)}
                      className="bg-indigo-600 dark:bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <Bell size={20} className="mr-2" />
                      Send Notification
                    </button>
                  </div>
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
                                    src={`https://ui-avatars.com/api/?name=${task.assignedTo}&background=6366f1&color=fff&size=24`}
                                    alt="Assignee avatar"
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Assigned To: {getUserDisplayName(task.assignedTo)}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Due: {format(new Date(task.dueDate), "dd/MM/yyyy hh:mm a")}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Status: <span className={`capitalize ${task.status === 'completed' ? 'text-green-600 dark:text-green-300' : task.status === 'in-progress' ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>{task.status}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Remarks: {task.remarks || "None"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/playground/${workspaceId}/${task.type}s`, { state: { task } })}
                                  className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                  title="View"
                                >
                                  <Eye size={20} />
                                </button>
                                <button
                                  onClick={() => {
                                    setNewTask({ ...task });
                                    setShowTaskPopup(true);
                                  }}
                                  className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                  title="Edit"
                                >
                                  <Edit3 size={20} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
                                  title="Delete"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Update Status
                              </label>
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleUpdateTask(task.id, { ...task, status: e.target.value })
                                }
                                className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Remarks
                              </label>
                              <textarea
                                value={task.remarks || ""}
                                onChange={(e) =>
                                  handleUpdateTask(task.id, { ...task, remarks: e.target.value })
                                }
                                className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
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
                                Due: {format(new Date(task.dueDate), "dd/MM/yyyy hh:mm a")}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Status: <span className={`capitalize ${task.status === 'completed' ? 'text-green-600 dark:text-green-300' : task.status === 'in-progress' ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>{task.status}</span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Remarks: {task.remarks || "None"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/playground/${workspaceId}/${task.type}s`, { state: { task } })}
                                className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                                title="View"
                              >
                                <Eye size={20} />
                              </button>
                            </div>
                          </div>
                          {task.status !== "completed" && (
                            <div className="mt-4">
                              <button
                                onClick={() => handleNotifyOwner(task)}
                                className="w-full bg-indigo-600 dark:bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors flex items-center justify-center"
                              >
                                <PlusCircle size={20} className="mr-2" />
                                Mark as Completed
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                Members
              </h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  Owner
                </h3>
                <div className="flex items-center gap-4 mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <img
                    src={
                      getUserById(workspace.owner).profileImage ||
                      `https://ui-avatars.com/api/?name=${getUserById(workspace.owner).username}&background=6366f1&color=fff&size=40`
                    }
                    alt="Owner Avatar"
                    className="w-10 h-10 rounded-full border-2 border-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {getUserById(workspace.owner).username}
                      {getUserById(workspace.owner).userId === currentUser.id && (
                        <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {getUserById(workspace.owner).email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                        Owner
                      </span>
                      {getUserById(workspace.owner).accountNonLocked && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                      {getUserById(workspace.owner).twoFactorEnabled && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                          2FA Enabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  Participants
                </h3>
                {workspace.participants?.length > 0 ? (
                  <div className="space-y-4">
                    {workspace.participants.map((email) => {
                      const user = getUserByEmail(email);
                      return (
                        <div
                          key={email}
                          className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        >
                          <img
                            src={
                              user.profileImage ||
                              `https://ui-avatars.com/api/?name=${user.username || email.split("@")[0]}&background=6366f1&color=fff&size=40`
                            }
                            alt="Participant Avatar"
                            className="w-10 h-10 rounded-full border-2 border-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {user.username || email.split("@")[0]}
                              {email === currentUser.email && (
                                <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{email}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {user.accountNonLocked ? (
                                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="text-xs bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
                                  Locked
                                </span>
                              )}
                              {user.twoFactorEnabled && (
                                <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                                  2FA Enabled
                                </span>
                              )}
                              {user.role && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 px-2 py-1 rounded-full">
                                  {user.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No participants yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="space-y-6">
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
                          className={`mb-3 flex ${
                            msg.sender === currentUser.username ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg flex items-start gap-2 shadow-sm ${
                              msg.sender === currentUser.username
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
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="ml-2 bg-indigo-600 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                Tools
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                    onClick={tool.onClick}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 dark:bg-gradient-to-r dark:from-indigo-800 dark:to-purple-800 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {tool.icon}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {tool.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                      >
                        <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <motion.div
                          className="bg-white dark:bg-gray-800 absolute top-8 right-0 w-64 p-4 rounded-lg shadow-lg z-10 hidden group-hover:block"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tool.helpText}
                          </p>
                        </motion.div>
                      </motion.div>
                    </div>
                    <motion.div
                      className="mt-4 h-1 w-0 bg-indigo-500 dark:bg-indigo-300 rounded-full"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  Recent Content
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentContent.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                      onClick={() =>
                        navigate(
                          item.type === "Code"
                            ? `/playground/${workspaceId}/codes`
                            : item.type === "Note"
                              ? `/playground/${workspaceId}/notes`
                              : `/whiteboard-playground/${workspaceId}`
                        )
                      }
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 dark:bg-gradient-to-r dark:from-indigo-800 dark:to-purple-800 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300" />
                      <div className="relative">
                        <div
                          className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-800 w-fit mb-2"
                        >
                          {item.type === "Code" ? (
                            <Code className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
                          ) : item.type === "Note" ? (
                            <Edit3 className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
                          ) : (
                            <Layout className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
                          )}
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.content}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-2">
                          {item.type}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "video-call" && (
            <VideoCall
              workspace={workspace}
              isOwner={isOwner}
              currentUser={currentUser}
              getUserDisplayName={getUserDisplayName}
            />
          )}

          {/* Task Creation Popup */}
          {showTaskPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-2xl w-full">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  Create New Task
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assigned To
                    </label>
                    <div className="max-h-40 overflow-y-auto bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-2">
                      <label className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="assignedTo"
                          value="all"
                          checked={newTask.assignedTo === "all"}
                          onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                          className="form-radio text-indigo-600 dark:text-indigo-300 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                        />
                        <span className="text-gray-700 dark:text-gray-300">All Participants</span>
                      </label>
                      {workspace?.participants?.length > 0 ? (
                        workspace.participants.map((email) => (
                          <label
                            key={email}
                            className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="assignedTo"
                              value={email}
                              checked={newTask.assignedTo === email}
                              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                              className="form-radio text-indigo-600 dark:text-indigo-300 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                            />
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=6366f1&color=fff&size=24`}
                              alt={`${email} avatar`}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{email}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No participants available</p>
                      )}
                    </div>
                    {(!workspace?.participants || workspace.participants.length === 0) && (
                      <p className="text-sm text-red-500 mt-1">No participants found.</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={newTask.startDate ? new Date(new Date(newTask.startDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        const localDate = e.target.value ? new Date(e.target.value).toISOString() : "";
                        setNewTask({ ...newTask, startDate: localDate });
                      }}
                      className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate ? new Date(new Date(newTask.dueDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        const localDate = e.target.value ? new Date(e.target.value).toISOString() : "";
                        setNewTask({ ...newTask, dueDate: localDate });
                      }}
                      className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task Type
                    </label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                    >
                      <option value="code">Code</option>
                      <option value="whiteboard">Whiteboard</option>
                      <option value="notes">Notes</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      placeholder="Enter task content"
                      value={newTask.content}
                      onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-4">
                    <button
                      onClick={handleCreateTask}
                      disabled={!newTask.assignedTo}
                      className="flex-1 bg-indigo-600 dark:bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    >
                      <PlusCircle size={20} className="mr-2" />
                      {newTask.id ? "Update Task" : "Create Task"}
                    </button>
                    <button
                      onClick={() => setShowTaskPopup(false)}
                      className="flex-1 bg-gray-600 dark:bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Popup */}
          {showNotificationPopup && isOwner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  Send Notification
                </h3>
                <div className="space-y-4">
                  <textarea
                    placeholder="Enter notification message..."
                    value={newNotification}
                    onChange={(e) => setNewNotification(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handleSendNotification}
                      className="flex-1 bg-indigo-600 dark:bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <Bell size={20} className="mr-2" />
                      Send Notification
                    </button>
                    <button
                      onClick={() => setShowNotificationPopup(false)}
                      className="flex-1 bg-gray-600 dark:bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDashboard;