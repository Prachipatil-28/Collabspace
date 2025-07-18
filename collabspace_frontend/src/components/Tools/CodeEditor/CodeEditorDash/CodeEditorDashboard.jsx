import React, { useState } from "react";
import { FiEdit, FiTrash, FiEye, FiPlus, FiSearch } from "react-icons/fi";

const CodeEditorDashboard = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Todo App",
      createdAt: "2025-01-10 14:23",
      snippet: "function addTask(task) { return taskList.push(task); }",
      tags: ["JavaScript", "React"],
    },
    {
      id: 2,
      name: "Portfolio Website",
      createdAt: "2025-01-08 10:15",
      snippet: "<header>Welcome to my portfolio!</header>",
      tags: ["HTML", "CSS"],
    },
    {
      id: 3,
      name: "Calculator",
      createdAt: "2025-01-12 09:30",
      snippet: "const calculate = (a, b) => a + b;",
      tags: ["JavaScript", "UI"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Code Editor Dashboard</h1>
        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <FiPlus className="mr-2" />
          New Project
        </button>
      </header>

      {/* Search and Filter */}
      <div className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
            <option value="recent">Sort by: Recent</option>
            <option value="name">Sort by: Name</option>
          </select>
        </div>
      </div>

      {/* Project Cards */}
      <main className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-bold">{project.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created: {project.createdAt}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {project.snippet.length > 50
                  ? `${project.snippet.slice(0, 50)}...`
                  : project.snippet}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-500 dark:text-blue-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                <FiEye className="mr-1" />
                View
              </button>
              <button className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                <FiEdit className="mr-1" />
                Edit
              </button>
              <button
                onClick={() =>
                  setProjects(projects.filter((p) => p.id !== project.id))
                }
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                <FiTrash className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No projects found.</p>
        </div>
      )}
    </div>
  );
};

export default CodeEditorDashboard;
