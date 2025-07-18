import React from "react";
import { motion } from "framer-motion";

const SettingsModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div className="bg-gray-800 p-6 rounded-lg w-96 border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-gray-300">
            <span>Dark Mode</span>
            <input type="checkbox" className="toggle" />
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsModal;