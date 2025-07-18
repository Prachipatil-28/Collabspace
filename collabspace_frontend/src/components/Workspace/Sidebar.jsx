import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const Sidebar = ({ tools, activeTool, setActiveTool }) => {
  return (
    <aside className="w-64 bg-gray-200 dark:bg-gray-800 shadow-lg">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">Tools</h2>
      </div>
      <ul className="space-y-2">
        {tools.map((tool) => (
          <li key={tool.name}>
            <button
              onClick={() => setActiveTool(tool)}
              className={`flex items-center space-x-2 px-4 py-2 w-full text-left rounded-lg ${
                activeTool.name === tool.name
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <tool.icon size={20} />
              <span>{tool.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};


export default Sidebar;
