import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

const KanbanBoard = ({ workspaceId, currentUser, isLeader, tasks, setTasks, teamMembers, wsRef }) => {
  const [columns, setColumns] = useState({
    "To Do": [],
    "In Progress": [],
    "Completed": []
  });

  useEffect(() => {
    const groupedTasks = {
      "To Do": tasks.filter(task => task.status === "Pending"),
      "In Progress": tasks.filter(task => task.status === "In Progress"),
      "Completed": tasks.filter(task => task.status === "Completed")
    };
    setColumns(groupedTasks);
  }, [tasks]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    try {
      const response = await api.patch(`/api/workspace/${workspaceId}/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data : task))
      );
      toast.success("Task status updated!");
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "KANBAN_UPDATED", data: response.data, workspaceId })
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status.");
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDeleteTask = async (taskId) => {
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

  return (
    <div className="flex space-x-4 overflow-x-auto">
      {Object.entries(columns).map(([status, tasksInColumn]) => (
        <div
          key={status}
          onDrop={(e) => handleDrop(e, status === "To Do" ? "Pending" : status)}
          onDragOver={allowDrop}
          className="flex-1 min-w-[250px] bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
            {status} ({tasksInColumn.length})
          </h3>
          <div className="space-y-4">
            {tasksInColumn.map((task) => (
              <motion.div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${task.assignee || 'Team'}&background=6366f1&color=fff&size=24`}
                        alt="Assignee avatar"
                        className="w-6 h-6 rounded-full"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.type === "team" ? "Team" : task.assignee}
                      </p>
                    </div>
                    {task.dueDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {format(new Date(task.dueDate), "dd/MM/yyyy")}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Priority: {task.priority}
                    </p>
                  </div>
                  {isLeader && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;