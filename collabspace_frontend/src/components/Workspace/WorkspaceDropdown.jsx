// src/components/Header/WorkspaceDropdown.jsx
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const WorkspaceDropdown = () => {
  const workspaces = ["Workspace 1", "Workspace 2", "Workspace 3"]; // Replace with API call.

  return (
    <div className="relative">
      <button className="flex items-center bg-gray-700 px-4 py-2 rounded-md">
        Select Workspace <FaChevronDown className="ml-2" />
      </button>
      <ul className="absolute mt-2 bg-white text-black rounded-md shadow-lg">
        {workspaces.map((workspace, index) => (
          <li key={index} className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
            {workspace}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkspaceDropdown;
