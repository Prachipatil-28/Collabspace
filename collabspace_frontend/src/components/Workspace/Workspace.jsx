// src/components/Workspace.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../api/api";
import { FiPlus, FiLogOut, FiUserPlus } from "react-icons/fi";
import { AppContext } from "../../store/AppContext";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const Workspace = () => {
  const navigate = useNavigate();
  const { activeWorkspace, setActiveWorkspace } = useContext(AppContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [workspaceType, setWorkspaceType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const owner = localStorage.getItem("username") || "Guest";

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.filter((user) => user.userName !== owner));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
    }
  };

  const setupWebSocket = (workspaceId, type) => {
    if (type === "individual") return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    client.connect({}, () => {
      client.subscribe(`/topic/workspace/${workspaceId}/update`, (message) => {
        const update = JSON.parse(message.body);
        toast.success(`Workspace ${update.workspaceName} updated!`);
        loadWorkspaces();
      });
    });
    setStompClient(client);
  };

  const createWorkspace = async (data) => {
    setLoading(true);
    const selectedParticipants = data.participants || [];
    const newWorkspace = {
      workspaceName: data.name,
      workspaceDescription: data.description,
      owner,
      type: workspaceType,
      participants: workspaceType === "individual" ? [owner] : selectedParticipants,
    };

    if (workspaceType === "group" && (newWorkspace.participants.length < 10 || newWorkspace.participants.length > 500)) {
      toast.error("Group workspace must have 10-500 participants.");
      setLoading(false);
      return;
    }
    if (workspaceType === "team" && newWorkspace.participants.length > 10) {
      toast.error("Team workspace cannot exceed 10 participants.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/workspace/create", newWorkspace);
      toast.success("Workspace created successfully!");
      setWorkspaces([...workspaces, response.data]);
      reset();
      setShowForm(false);
      setActiveWorkspace(response.data);
      if (workspaceType !== "individual") setupWebSocket(response.data.workspaceId, workspaceType);

      // Redirect to type-specific dashboard
      navigate(`/workspace/${workspaceType}/${response.data.workspaceId}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const response = await api.get("/workspace/getAll");
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces.");
    }
  };

  const joinWorkspace = async (workspaceId) => {
    try {
      await api.post(`/workspace/${workspaceId}/join`, { username: owner });
      toast.success("Joined workspace successfully!");
      loadWorkspaces();
      const workspace = workspaces.find((w) => w.workspaceId === workspaceId);
      if (workspace.type !== "individual") setupWebSocket(workspaceId, workspace.type);
    } catch (error) {
      console.error("Error joining workspace:", error);
      toast.error("Failed to join workspace.");
    }
  };

  useEffect(() => {
    loadWorkspaces();
    fetchUsers();
    return () => {
      if (stompClient) stompClient.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight">CollabSpace</h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img
                src={`https://ui-avatars.com/api/?name=${owner}&background=random`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
              <span className="text-lg font-medium">{owner}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center transition duration-300"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">My Workspaces</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition duration-300 shadow-md"
          >
            <FiPlus className="mr-2" /> Create Workspace
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit(createWorkspace)}
            className="bg-white rounded-xl shadow-lg p-6 mb-10 animate-fade-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Workspace Name</label>
                <input
                  type="text"
                  {...register("name", { required: "Workspace name is required" })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-700 font-semibold mb-2">Workspace Type</label>
              <select
                onChange={(e) => setWorkspaceType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="team">Team</option>
              </select>
            </div>

            {workspaceType !== "individual" && (
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">Participants</label>
                <select
                  multiple
                  {...register("participants", { required: "Select at least one participant" })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 max-h-40 overflow-y-auto"
                >
                  {users.map((user) => (
                    <option key={user.userId} value={user.userName}>
                      {user.userName} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.participants && (
                  <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create Workspace"}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.workspaceId}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-bold text-gray-800">{workspace.workspaceName}</h3>
              <p className="text-sm text-gray-600 mt-1">{workspace.workspaceDescription}</p>
              <p className="text-sm text-indigo-600 mt-2">Owner: {workspace.owner}</p>
              <p className="text-sm text-indigo-600">Type: {workspace.type}</p>
              <div className="mt-4">
                <p className="font-semibold text-gray-700">Participants:</p>
                <ul className="text-sm text-gray-600 mt-1">
                  {workspace.participants.map((participant, index) => (
                    <li key={index} className="truncate">
                      {participant}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => navigate(`/workspace/${workspace.type}/${workspace.workspaceId}`)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-full transition duration-300 shadow-md"
                >
                  View
                </button>
                {workspace.owner !== owner && !workspace.participants.includes(owner) && (
                  <button
                    onClick={() => joinWorkspace(workspace.workspaceId)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full flex items-center transition duration-300 shadow-md"
                  >
                    <FiUserPlus className="mr-2" /> Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Workspace;