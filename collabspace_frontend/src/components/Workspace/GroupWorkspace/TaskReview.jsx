import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, AlertCircle, X } from "lucide-react";
import { useTheme } from "../../../store/ThemeProvider";

const TaskReview = () => {
  const { workspaceId, taskId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { darkMode } = useTheme();
  const [task, setTask] = useState(state?.task || null);
  const [status, setStatus] = useState(task?.status || "Incomplete");
  const [remarks, setRemarks] = useState(task?.remarks || "");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        setIsOwner(response.data.ownerId === api.getCurrentUser()?.id);
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace.");
      }
    };
    fetchWorkspace();

    if (!task) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/workspace/${workspaceId}/tasks/${taskId}`);
          setTask(response.data);
          setStatus(response.data.status);
          setRemarks(response.data.remarks || "");
        } catch (error) {
          console.error("Error fetching task:", error);
          toast.error("Failed to load task.");
        }
      };
      fetchTask();
    }
  }, [workspaceId, taskId, task]);

  const handleUpdateTask = async () => {
    if (!isOwner) {
      toast.error("Only the owner can update task status.");
      return;
    }
    try {
      const updatedTask = { status, remarks };
      await api.patch(`/workspace/${workspaceId}/tasks/${taskId}`, updatedTask);
      const notification = {
        id: Date.now(),
        message: `Task "${task.title}" marked as ${status}${
          remarks ? ` with remarks: ${remarks}` : ""
        }`,
        timestamp: new Date().toISOString(),
        recipient: task.assignedTo || "group",
      };
      await api.post(`/workspace/${workspaceId}/notifications`, notification);

      // Broadcast the task update via WebSocket
      const ws = new WebSocket(`ws://localhost:8080/ws/workspace/${workspaceId}`);
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "TASK_UPDATED",
            data: { id: taskId, status, remarks },
            notification,
            workspaceId,
          })
        );
        ws.close();
      };

      toast.success("Task updated!");
      navigate(`/dashboard/${workspaceId}`, { state: { activeTab: "reviewTasks" } });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 text-gray-900 dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 font-sans text-gray-900 dark:text-gray-100">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(`/dashboard/${workspaceId}`, { state: { activeTab: "reviewTasks" } })
              }
              className="mr-4 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                Review Task: {task.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Assigned to: {task.assignedTo || "Group"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
              Task Details
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Type
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{task.type}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Start Date
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(task.startDate).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Due Date
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(task.dueDate).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Content
                </h3>
                {task.type === "code" ? (
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code>{task.content || "No code provided."}</code>
                  </pre>
                ) : task.type === "whiteboard" ? (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-300">
                      {task.content || "No whiteboard content provided."}
                    </p>
                    {/* In a real app, this could render an image or canvas */}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {task.content || "No notes provided."}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Current Status
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{task.status}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Current Remarks
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {task.remarks || "No remarks provided."}
                </p>
              </div>
              {isOwner && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                      Update Status
                    </h3>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Incomplete">Incomplete</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                      Add Remarks
                    </h3>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks..."
                      className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={handleUpdateTask}
                    className="w-full bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center justify-center"
                  >
                    <CheckCircle size={20} className="mr-2" />
                    Update Task
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskReview;