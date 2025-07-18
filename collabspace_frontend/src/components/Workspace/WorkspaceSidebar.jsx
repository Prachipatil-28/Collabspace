// src/components/WorkspaceSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const WorkspaceSidebar = ({ isCollapsed, toggleSidebar }) => {
  const tools = [
    { name: "Code Editor", icon: "📝" },
    { name: "Whiteboard", icon: "🎨" },
    { name: "Notes", icon: "📋" },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="p-4 w-full text-left hover:bg-gray-200"
      >
        {isCollapsed ? ">" : "<"}
      </button>

      {/* Navigation Links */}
      <nav className="mt-4">
        <ul>
          <li className="mb-2">
            <Link
              to="/workspace/home"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg"
            >
              <span>🏠</span>
              {!isCollapsed && <span>Home</span>}
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/workspace/sessions"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg"
            >
              <span>📚</span>
              {!isCollapsed && <span>Sessions</span>}
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/workspace/profile"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg"
            >
              <span>👤</span>
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/workspace/settings"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg"
            >
              <span>⚙️</span>
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Tools Section */}
      {!isCollapsed && (
        <div className="mt-4">
          <h3 className="text-sm font-bold px-4">Tools</h3>
          <ul>
            {tools.map((tool, index) => (
              <li key={index} className="mb-2">
                <Link
                  to={`/workspace/tools/${tool.name.toLowerCase()}`}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg"
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default WorkspaceSidebar;