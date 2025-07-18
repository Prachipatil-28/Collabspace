import React from "react";
import { Link } from "react-router-dom";
import { FaStickyNote, FaCode, FaChalkboard } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full bg-blue-500 text-white py-12 text-center shadow-lg">
        <h1 className="text-5xl font-bold mb-4">Welcome to CollabSpace</h1>
        <p className="text-lg font-medium max-w-3xl mx-auto">
          Collaborate, create, and innovate in a virtual workspace designed for individuals and teams.
        </p>
        <div className="mt-6">
          <Link
            to="/workspace"
            className="bg-white text-blue-500 py-2 px-6 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Tools Section */}
      <div className="max-w-6xl w-full px-6 py-10">
        <h3 className="text-3xl font-bold text-gray-800 text-center mb-8">Tools at Your Fingertips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/tools/notes"
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <FaStickyNote className="text-blue-500 text-4xl mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-800">Notes</h4>
            <p className="text-gray-600 text-sm">
              Capture and organize your ideas effortlessly.
            </p>
          </Link>

          <Link
            to="/tools/code-editor"
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <FaCode className="text-green-500 text-4xl mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-800">Code Editor</h4>
            <p className="text-gray-600 text-sm">
              Write, edit, and execute code in multiple languages.
            </p>
          </Link>

          <Link
            to="/tools/whiteboard"
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-transform transform hover:scale-105"
          >
            <FaChalkboard className="text-purple-500 text-4xl mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-800">Whiteboard</h4>
            <p className="text-gray-600 text-sm">
              Collaborate visually with your team in real-time.
            </p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-blue-600 text-white py-6 text-center">
        <p className="text-sm">&copy; 2025 CollabSpace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
