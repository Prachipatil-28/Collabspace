import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { IoIosNotificationsOutline, IoMdClose } from "react-icons/io";
import { FaHome, FaSearch, FaChevronLeft, FaChevronRight, FaTrash, FaEdit, FaSun, FaMoon } from "react-icons/fa";
import { RiAccountCircleFill, RiFileList3Line } from "react-icons/ri";
import { FiPlus, FiLogOut, FiUserPlus } from "react-icons/fi";
import { MdOutlinePublish, MdOutlineLightbulb } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { AppContext } from "../../../store/AppContext.jsx";
import toast from "react-hot-toast";
import api from "../../../api/api";
import { useMyContext } from "../../../store/ContextApi.jsx";
import { useTheme } from "../../../store/ThemeProvider.jsx";
import MyContent from "./MyContent.jsx";
import Publish from "./Publish.jsx";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("Home");
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [joinedWorkspaces, setJoinedWorkspaces] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaceType, setWorkspaceType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [availableWorkspaces, setAvailableWorkspaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const { activeWorkspace, setActiveWorkspace } = useContext(AppContext);
  const { currentUser, loading: contextLoading } = useMyContext();
  const { darkMode, toggleDarkMode } = useTheme();

  const workspacesPerPage = 6;
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const user = JSON.parse(localStorage.getItem("user")) || { userName: "Guest", email: "guest@example.com", role: "User", id: null };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/all");
      setUsers(response.data.filter((u) => u.email !== (currentUser?.email || user.email)));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
    }
  };

  const fetchAllWorkspaces = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await api.get(`/workspace/user/${currentUser.id}`);
      const processedWorkspaces = response.data.map(workspace => ({
        ...workspace,
        type: (workspace.type || "individual").toLowerCase(),
        participants: (workspace.participants || []).map(p => p.trim())
      }));
      setAllWorkspaces(processedWorkspaces);
    } catch (error) {
      console.error("Error fetching all workspaces:", error);
      toast.error("Failed to load workspaces.");
    }
  };

  const fetchJoinedWorkspaces = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await api.get(`/workspace/user/${currentUser.id}/all`);
      const processedWorkspaces = response.data.map(workspace => ({
        ...workspace,
        type: (workspace.type || "individual").toLowerCase(),
        participants: (workspace.participants || []).map(p => p.trim())
      }));
      setJoinedWorkspaces(processedWorkspaces);
    } catch (error) {
      console.error("Error fetching joined workspaces:", error);
      toast.error("Failed to load joined workspaces.");
    }
  };

  const fetchAvailableWorkspaces = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await api.get(`/workspace/user/${currentUser.id}/all`);
      const processedWorkspaces = response.data.map(workspace => ({
        ...workspace,
        type: (workspace.type || "individual").toLowerCase(),
        participants: (workspace.participants || []).map(p => p.trim())
      }));
      const available = processedWorkspaces.filter(workspace =>
        !workspace.participants.includes(currentUser?.email || user.email) &&
        workspace.owner !== (currentUser?.id || user.id)
      );
      setAvailableWorkspaces(available);
    } catch (error) {
      console.error("Error fetching available workspaces:", error);
      toast.error("Failed to load available workspaces.");
    }
  };

  const createWorkspace = async (data) => {
    setLoading(true);
    const selectedParticipants = data.participants || [];
    const newWorkspace = {
      workspaceName: data.name,
      workspaceDescription: data.description,
      owner: currentUser?.id || user.id || user.email,
      type: workspaceType,
      participants: workspaceType === "individual" ? [currentUser?.email || user.email] : selectedParticipants,
    };

    try {
      const response = await api.post("/workspace/create", newWorkspace);
      toast.success("Workspace created successfully!");
      fetchAllWorkspaces();
      reset();
      setShowCreateForm(false);
      setSelectAll(false);
      setActiveWorkspace(response.data);
      navigate(`/workspace/${workspaceType}/${response.data.workspaceId}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  const editWorkspace = async (data) => {
    setLoading(true);
    const selectedParticipants = data.participants || [];
    const updatedWorkspace = {
      workspaceName: data.name,
      workspaceDescription: data.description,
      type: workspaceType,
      participants: workspaceType === "individual" ? [currentUser?.email || user.email] : selectedParticipants,
    };

    try {
      await api.put(`/workspace/${selectedWorkspace.workspaceId}`, updatedWorkspace);
      toast.success("Workspace updated successfully!");
      fetchAllWorkspaces();
      fetchJoinedWorkspaces();
      reset();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating workspace:", error);
      toast.error("Failed to update workspace.");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      setLoading(true);
      try {
        await api.delete(`/workspace/${workspaceId}`);
        toast.success("Workspace deleted successfully!");
        fetchAllWorkspaces();
        fetchJoinedWorkspaces();
        fetchAvailableWorkspaces();
      } catch (error) {
        console.error("Error deleting workspace:", error);
        toast.error("Failed to delete workspace.");
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (workspace) => {
    setSelectedWorkspace(workspace);
    setWorkspaceType(workspace.type);
    setValue("name", workspace.workspaceName);
    setValue("description", workspace.workspaceDescription);
    setValue("participants", workspace.participants);
    setShowEditForm(true);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterWorkspaces(query, typeFilter, activeComponent);
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    filterWorkspaces(searchQuery, type, activeComponent);
    setCurrentPage(1);
  };

  const filterWorkspaces = (query, type, component) => {
    const sourceWorkspaces = component === "JoinedWorkspaces" ? joinedWorkspaces : allWorkspaces;
    let filtered = sourceWorkspaces;

    if (query) {
      filtered = filtered.filter(workspace =>
        workspace.workspaceName.toLowerCase().includes(query) ||
        workspace.workspaceDescription.toLowerCase().includes(query)
      );
    }

    if (type !== "all") {
      filtered = filtered.filter(workspace => workspace.type === type.toLowerCase());
    }

    setFilteredWorkspaces(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const indexOfLastWorkspace = currentPage * workspacesPerPage;
  const indexOfFirstWorkspace = indexOfLastWorkspace - workspacesPerPage;
  const currentWorkspaces = filteredWorkspaces.slice(indexOfFirstWorkspace, indexOfLastWorkspace);
  const totalPages = Math.ceil(filteredWorkspaces.length / workspacesPerPage);

  useEffect(() => {
    if (!contextLoading && currentUser) {
      fetchAllWorkspaces();
      fetchJoinedWorkspaces();
      fetchUsers();
      fetchAvailableWorkspaces();
    }
  }, [contextLoading, currentUser]);

  useEffect(() => {
    filterWorkspaces(searchQuery, typeFilter, activeComponent);
  }, [allWorkspaces, joinedWorkspaces, activeComponent]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setValue("participants", users.map(user => user.email));
    } else {
      setValue("participants", []);
    }
  };

  const renderContent = () => {
    if (contextLoading) {
      return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading user data...</div>;
    }

    if (!currentUser) {
      return (
        <div className="text-center py-12 text-red-500">
          Failed to load user data. Please log in again.
          <button onClick={handleLogout} className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline">
            Log out
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">My Workspaces</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-300" />
              </div>
              <input
                type="text"
                placeholder="Search workspaces..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTypeFilter("all")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "all" ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => handleTypeFilter("individual")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "individual" ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' : ''}`}
              >
                Individual
              </button>
              <button
                onClick={() => handleTypeFilter("team")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "team" ? 'bg-gradient-to-r from-green-600 to-green-800 text-white' : ''}`}
              >
                Team
              </button>
              <button
                onClick={() => handleTypeFilter("group")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "group" ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white' : ''}`}
              >
                Group
              </button>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-full flex items-center justify-center transition duration-300 shadow-md"
              disabled={contextLoading || !currentUser}
            >
              <FiPlus className="mr-2" /> New Workspace
            </button>
          </div>
        </div>

        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No workspaces found. Create a new one to get started!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentWorkspaces.map((workspace) => (
                <div
                  key={workspace.workspaceId}
                  className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{workspace.workspaceName}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        workspace.type === "individual"
                          ? "bg-blue-100 dark:bg-blue-500 text-blue-800 dark:text-white"
                          : workspace.type === "team"
                          ? "bg-green-100 dark:bg-green-500 text-green-800 dark:text-white"
                          : "bg-purple-100 dark:bg-purple-500 text-purple-800 dark:text-white"
                      }`}
                    >
                      {workspace.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex-grow">{workspace.workspaceDescription}</p>
                  {workspace.type !== "individual" && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Participants:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workspace.participants.slice(0, 3).map((participant, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ${
                              participant === workspace.owner ? "font-bold" : ""
                            }`}
                          >
                            {participant}
                          </span>
                        ))}
                        {workspace.participants.length > 3 && (
                          <span className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                            +{workspace.participants.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {formatDate(workspace.createdDate)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(workspace)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        title="Edit Workspace"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteWorkspace(workspace.workspaceId)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        title="Delete Workspace"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => navigate(`/workspace/${workspace.type}/${workspace.workspaceId}`)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full text-sm transition duration-300 shadow-md"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border-t border-b border-gray-300 dark:border-gray-600 ${currentPage === page ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderJoinedWorkspaces = () => {
    if (contextLoading) {
      return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading user data...</div>;
    }

    if (!currentUser) {
      return (
        <div className="text-center py-12 text-red-500">
          Failed to load user data. Please log in again.
          <button onClick={handleLogout} className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline">
            Log out
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Joined Workspaces</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-300" />
              </div>
              <input
                type="text"
                placeholder="Search joined workspaces..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTypeFilter("all")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "all" ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => handleTypeFilter("individual")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "individual" ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' : ''}`}
              >
                Individual
              </button>
              <button
                onClick={() => handleTypeFilter("team")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "team" ? 'bg-gradient-to-r from-green-600 to-green-800 text-white' : ''}`}
              >
                Team
              </button>
              <button
                onClick={() => handleTypeFilter("group")}
                className={`px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 ${typeFilter === "group" ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white' : ''}`}
              >
                Group
              </button>
            </div>
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-full flex items-center justify-center transition duration-300 shadow-md"
              disabled={contextLoading || !currentUser}
            >
              <FiUserPlus className="mr-2" /> Join Workspace
            </button>
          </div>
        </div>

        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No joined workspaces found. Join one to get started!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentWorkspaces.map((workspace) => (
                <div
                  key={workspace.workspaceId}
                  className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{workspace.workspaceName}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        workspace.type === "individual"
                          ? "bg-blue-100 dark:bg-blue-500 text-blue-800 dark:text-white"
                          : workspace.type === "team"
                          ? "bg-green-100 dark:bg-green-500 text-green-800 dark:text-white"
                          : "bg-purple-100 dark:bg-purple-500 text-purple-800 dark:text-white"
                      }`}
                    >
                      {workspace.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex-grow">{workspace.workspaceDescription}</p>
                  {workspace.type !== "individual" && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Participants:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workspace.participants.slice(0, 3).map((participant, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ${
                              participant === workspace.owner ? "font-bold" : ""
                            }`}
                          >
                            {participant}
                          </span>
                        ))}
                        {workspace.participants.length > 3 && (
                          <span className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                            +{workspace.participants.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {formatDate(workspace.createdDate)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(workspace)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        title="Edit Workspace"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteWorkspace(workspace.workspaceId)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        title="Delete Workspace"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => navigate(`/workspace/${workspace.type}/${workspace.workspaceId}`)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full text-sm transition duration-300 shadow-md"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border-t border-b border-gray-300 dark:border-gray-600 ${currentPage === page ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const joinWorkspace = async (workspaceId) => {
    setLoading(true);
    try {
      await api.post(`/workspace/${workspaceId}/join`, { username: currentUser?.email || user.email });
      toast.success("Joined workspace successfully!");
      fetchJoinedWorkspaces();
      fetchAvailableWorkspaces();
      setShowJoinForm(false);
    } catch (error) {
      console.error("Error joining workspace:", error);
      toast.error("Failed to join workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div
        className={`h-screen bg-gray-100 dark:bg-gray-800 flex flex-col transition-all duration-300 shadow-lg ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mx-auto mb-6 px-4 py-4">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <span className="w-12 h-12 rounded-full">
                  <img src="collabspace_logo.png" alt="Logo" className="rounded-full" />
                </span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                  CollabSpace
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
          <nav className="mt-5 px-4 flex-1">
            <div>
              {!sidebarCollapsed && (
                <h3 className="ml-3 text-gray-500 dark:text-gray-400 font-medium">MENU</h3>
              )}
              <ul className="flex flex-col gap-1.5 mt-3">
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "Home" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("Home")}
                    title="Home"
                  >
                    <FaHome />
                    {!sidebarCollapsed && "Home"}
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "JoinedWorkspaces" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("JoinedWorkspaces")}
                    title="Joined Workspaces"
                  >
                    <FiUserPlus />
                    {!sidebarCollapsed && "Joined Workspaces"}
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "MyContent" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("MyContent")}
                    title="My Content"
                  >
                    <RiFileList3Line />
                    {!sidebarCollapsed && "My Content"}
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "Publish" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("Publish")}
                    title="Publish"
                  >
                    <MdOutlinePublish />
                    {!sidebarCollapsed && "Publish"}
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "YourIdeas" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("YourIdeas")}
                    title="Your Ideas"
                  >
                    <MdOutlineLightbulb />
                    {!sidebarCollapsed && "Your Ideas"}
                  </button>
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              {!sidebarCollapsed && (
                <h3 className="mt-8 mb-2 ml-3 text-gray-500 dark:text-gray-400 font-medium">ACCOUNT</h3>
              )}
              <ul className="mb-6 ml-3 mr-3 flex flex-col gap-1.5">
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "Profile" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("Profile")}
                    title="Profile"
                  >
                    <RiAccountCircleFill />
                    {!sidebarCollapsed && "Profile"}
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center gap-2.5 w-full text-gray-600 dark:text-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg ${
                      activeComponent === "Settings" ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    onClick={() => setActiveComponent("Settings")}
                    title="Settings"
                  >
                    <IoSettings />
                    {!sidebarCollapsed && "Settings"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="group relative flex items-center gap-2.5 rounded-lg px-4 py-2 text-gray-600 dark:text-gray-300 text-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left"
                    title="Logout"
                  >
                    <FiLogOut />
                    {!sidebarCollapsed && "Logout"}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-bold text-gray-700 dark:text-gray-100">
              {activeComponent === "Home" ? "Workspace Dashboard" :
               activeComponent === "JoinedWorkspaces" ? "Joined Workspaces" : activeComponent}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <FaSun className="text-2xl text-yellow-400" /> : <FaMoon className="text-2xl text-gray-600" />}
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <IoIosNotificationsOutline className="text-2xl text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {contextLoading ? (
                <div className="text-gray-500 dark:text-gray-400">Loading user...</div>
              ) : (
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full pl-3 pr-1 py-1">
                  <div className="text-right">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold block">
                      {currentUser?.username || user.userName}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{currentUser?.role || user.role}</span>
                  </div>
                  <img
                    src={`https://ui-avatars.com/api/?name=${currentUser?.username || user.userName}&background=random`}
                    alt="User"
                    className="w-10 h-10 text-white rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {activeComponent === "Home" ? renderContent() :
           activeComponent === "JoinedWorkspaces" ? renderJoinedWorkspaces() :
           activeComponent === "MyContent" ? <MyContent /> :
           activeComponent === "Publish" ? <Publish /> :
           <div className="text-center py-12 text-gray-500 dark:text-gray-400">Section under development</div>}
        </main>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl relative mx-4">
            <button
              onClick={() => {
                setShowCreateForm(false);
                reset();
                setSelectAll(false);
              }}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create New Workspace</h2>
            <form onSubmit={handleSubmit(createWorkspace)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Workspace Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Workspace name is required" })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter workspace name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Description</label>
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter description"
                    rows="1"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Workspace Type</label>
                <select
                  onChange={(e) => setWorkspaceType(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                  <option value="group">Group</option>
                </select>
              </div>
              {workspaceType !== "individual" && (
                <div className="mt-6">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Participants</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label htmlFor="select-all" className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                        Select All
                      </label>
                    </div>
                    {users.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center p-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          id={`participant-${user.userId}`}
                          value={user.email}
                          {...register("participants", {
                            required: workspaceType !== "individual" ? "Select at least one participant" : false,
                          })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.email.split("@")[0]}&background=random`}
                          alt={user.email}
                          className="w-8 h-8 rounded-full ml-3"
                        />
                        <label
                          htmlFor={`participant-${user.userId}`}
                          className="ml-3 text-gray-700 dark:text-gray-300"
                        >
                          {user.email}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
                  )}
                </div>
              )}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                    setSelectAll(false);
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || contextLoading || !currentUser}
                  className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition duration-200 ${
                    loading || contextLoading || !currentUser ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl relative mx-4">
            <button
              onClick={() => {
                setShowEditForm(false);
                reset();
              }}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Edit Workspace</h2>
            <div onSubmit={handleSubmit(editWorkspace)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Workspace Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Workspace name is required" })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter workspace name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Description</label>
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter description"
                    rows="1"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Workspace Type</label>
                <select
                  onChange={(e) => setWorkspaceType(e.target.value)}
                  value={workspaceType}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                  <option value="group">Group</option>
                </select>
              </div>
              {workspaceType !== "individual" && (
                <div className="mt-6">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Participants</label>
                  <select
                    multiple
                    {...register("participants", { required: "Select at least one participant" })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-40 overflow-y-auto"
                  >
                    {users.map((user) => (
                      <option key={user.userId} value={user.email}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
                  )}
                </div>
              )}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    reset();
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || contextLoading || !currentUser}
                  className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition duration-200 ${
                    loading || contextLoading || !currentUser ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSubmit(editWorkspace)}
                >
                  {loading ? "Updating..." : "Update Workspace"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl relative mx-4">
            <button
              onClick={() => setShowJoinForm(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Join a Workspace</h2>
            {availableWorkspaces.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">No workspaces available to join.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {availableWorkspaces.map((workspace) => (
                  <div
                    key={workspace.workspaceId}
                    className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{workspace.workspaceName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{workspace.workspaceDescription}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          workspace.type === "individual"
                            ? "bg-blue-100 dark:bg-blue-500 text-blue-800 dark:text-white"
                            : workspace.type === "team"
                            ? "bg-green-100 dark:bg-green-500 text-green-800 dark:text-white"
                            : "bg-purple-100 dark:bg-purple-500 text-purple-800 dark:text-white"
                        }`}
                      >
                        {workspace.type}
                      </span>
                    </div>
                    <button
                      onClick={() => joinWorkspace(workspace.workspaceId)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full text-sm transition duration-300 shadow-md"
                      disabled={loading}
                    >
                      {loading ? "Joining..." : "Join"}
                    </button>
                    </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowJoinForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;