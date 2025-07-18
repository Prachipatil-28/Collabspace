import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Edit,
  X,
  Code,
  PenTool,
  File,
  Plus,
} from "lucide-react";

const SessionDashboard = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTool, setActiveTool] = useState("overview");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", assignedTo: "" });
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", link: "" });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/session/${sessionId}`);
        setSession(response.data);
        setMembers(response.data.members || []);
        setIsOwner(response.data.ownerId === api.getCurrentUser()?.id);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Failed to load session.");
      }
    };
    fetchSession();
  }, [sessionId]);

  const calculateTimeLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    if (diff <= 0) return { expired: true, time: "Expired" };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { expired: false, time: `${days}d ${hours}h ${minutes}m` };
  };

  const handleCreateTask = async () => {
    try {
      const response = await api.post(`/session/${sessionId}/tasks`, newTask);
      setSession({ ...session, tasks: [...(session.tasks || []), response.data] });
      toast.success("Task created!");
      setNewTask({ title: "", description: "", dueDate: "", assignedTo: "" });
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task.");
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const response = await api.post(`/session/${sessionId}/meetings`, {
        ...newMeeting,
        sessionId,
      });
      setSession({ ...session, meetings: [...(session.meetings || []), response.data] });
      toast.success("Meeting scheduled!");
      setNewMeeting({ title: "", date: "", link: "" });
      setIsMeetingModalOpen(false);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting.");
    }
  };

  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      await api.patch(`/session/${sessionId}/tasks/${taskId}`, { completed });
      setSession({
        ...session,
        tasks: session.tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        ),
      });
      toast.success(`Task marked as ${completed ? "completed" : "incomplete"}!`);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  if (!session) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>;
  }

  const { expired, time } = calculateTimeLeft(session.deadline);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-700 text-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-indigo-600">
          <h2 className="text-xl font-bold">Session Tools</h2>
        </div>
        <div className="flex-1 p-3">
          {[
            { name: "Overview", icon: FileText, tool: "overview" },
            { name: "Code Editor", icon: Code, tool: "code" },
            { name: "Whiteboard", icon: PenTool, tool: "whiteboard" },
            { name: "Notes", icon: File, tool: "notes" },
          ].map((item) => (
            <button
              key={item.tool}
              onClick={() => setActiveTool(item.tool)}
              className={`w-full flex items-center p-3 rounded-lg mb-2 ${
                activeTool === item.tool
                  ? "bg-indigo-500 text-white"
                  : "text-indigo-100 hover:bg-indigo-600"
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/workspace/${session.workspaceId}`)}
              className="mr-4 text-indigo-700 hover:text-indigo-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">{session.title}</h1>
              <p className="text-sm text-gray-600">
                Deadline: {new Date(session.deadline).toLocaleDateString()} ({time})
              </p>
              {expired && <p className="text-sm text-red-600 font-medium">Session Expired</p>}
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus size={20} className="mr-2" /> New Task
              </button>
              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Calendar size={20} className="mr-2" /> New Meeting
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {activeTool === "overview" && (
            <div className="space-y-8">
              {/* Session Details */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Session Details</h2>
                <p className="text-gray-600">{session.description}</p>
                <p className="text-sm text-gray-500 mt-2">Session ID: {session.sessionId}</p>
                <p className="text-sm text-gray-500">Content Type: {session.contentType}</p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Tools:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {session.tools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-indigo-900">Tasks</h2>
                  {isOwner && (
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <Plus size={16} className="mr-1" /> Add Task
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {session.tasks && session.tasks.length > 0 ? (
                    session.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <h3 className="text-lg font-medium text-indigo-900">{task.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned to: {members.find((m) => m.id === task.assignedTo)?.name || "Unknown"}
                        </p>
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={task.completed || false}
                            onChange={(e) => toggleTaskCompletion(task.id, e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Completed</span>
                        </label>
                        {isOwner && (
                          <button
                            onClick={() => {
                              setNewTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="mt-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No tasks assigned yet.</p>
                  )}
                </div>
              </div>

              {/* Meetings */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-indigo-900">Meetings</h2>
                  {isOwner && (
                    <button
                      onClick={() => setIsMeetingModalOpen(true)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <Plus size={16} className="mr-1" /> Schedule Meeting
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {session.meetings && session.meetings.length > 0 ? (
                    session.meetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <h3 className="text-lg font-medium text-indigo-900">{meeting.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Date: {new Date(meeting.date).toLocaleString()}
                        </p>
                        <a
                          href={meeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          Join Meeting
                        </a>
                        {isOwner && (
                          <button
                            onClick={() => {
                              setNewMeeting(meeting);
                              setIsMeetingModalOpen(true);
                            }}
                            className="mt-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No meetings scheduled yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTool === "code" && (
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Code Editor</h2>
              <p className="text-gray-600">
                {isOwner
                  ? "Use this code editor to explain concepts or share code."
                  : "View and interact with the code shared in this session."}
              </p>
              {/* Implement collaborative code editor here */}
            </div>
          )}
          {activeTool === "whiteboard" && (
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Whiteboard</h2>
              <p className="text-gray-600">
                {isOwner
                  ? "Use this whiteboard to draw diagrams or explain concepts."
                  : "View and interact with the whiteboard content."}
              </p>
              {/* Implement interactive whiteboard here */}
            </div>
          )}
          {activeTool === "notes" && (
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">Notes</h2>
              <p className="text-gray-600">
                {isOwner
                  ? "Write notes or documentation for this session."
                  : "View the notes shared in this session."}
              </p>
              {/* Implement notes editor/viewer here */}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-900">
                {newTask.id ? "Edit Task" : "Create Task"}
              </h2>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task description"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              rows="4"
            />
            <input
              type="date"
              value={newTask.dueDate.split("T")[0] || ""}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Assign to...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {newTask.id ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-900">
                {newMeeting.id ? "Edit Meeting" : "Schedule Meeting"}
              </h2>
              <button
                onClick={() => setIsMeetingModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              placeholder="Meeting title"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="datetime-local"
              value={newMeeting.date.split(".")[0] || ""}
              onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="url"
              value={newMeeting.link}
              onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
              placeholder="Meeting link"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsMeetingModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                {newMeeting.id ? "Update Meeting" : "Schedule Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDashboard;