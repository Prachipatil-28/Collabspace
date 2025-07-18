import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";

const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white transition-all"
      >
        <FiSettings className="w-6 h-6" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-12 top-0 w-48 bg-gray-800 rounded-lg shadow-lg p-2"
        >
          <button className="w-full text-left p-2 text-gray-300 hover:bg-gray-700 rounded-lg">
            Profile
          </button>
          <button className="w-full text-left p-2 text-gray-300 hover:bg-gray-700 rounded-lg">
            Logout
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;