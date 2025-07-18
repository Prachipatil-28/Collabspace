// src/pages/HomePage.jsx
import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../store/AppContext";
import CreateSessionForm from "./createSessionform";

const HomePage = () => {
  const { activeWorkspace, sessions, refreshSessions } = useContext(AppContext);
  const [showForm, setShowForm] = React.useState(false);

  const username = localStorage.getItem("username") || "Guest";

  useEffect( () => {
  console.log(activeWorkspace);
  },[]);

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {username}!
        </h1>
        <p className="text-gray-600">
          You are currently working in the <strong>{activeWorkspace?.workspaceName}</strong> workspace.
        </p>
      </div>

      {/* My Works Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Work Title 1</h3>
            <p className="text-sm text-gray-500">Description of the work...</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Work Title 2</h3>
            <p className="text-sm text-gray-500">Another description of the work...</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Work Title 3</h3>
            <p className="text-sm text-gray-500">Yet another description of the work...</p>
          </div>
        </div>
      </div>

      {/* Current Sessions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={`/workspace/session/${session.id}`}
              className={`block p-4 rounded-lg shadow-md ${
                session.type === "private"
                  ? "border-red-200 bg-red-50"
                  : session.type === "public"
                  ? "border-blue-200 bg-blue-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-800">{session.name}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                Type:{" "}
                {session.type === "private" ? (
                  <span className="mr-2">🔒</span>
                ) : session.type === "public" ? (
                  <span className="mr-2">🌐</span>
                ) : (
                  <span className="mr-2">👥</span>
                )}
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </p>
              <p className="text-sm text-gray-600">
                Participants: {session.participants.join(", ") || "None"}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Create Session Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
            <CreateSessionForm activeWorkspace={activeWorkspace?.workspaceId} onClose={() => setShowForm(false)} refreshSessions={refreshSessions} />
          </div>
        </div>
      )}

      {/* Floating Create Session Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
      >
        +
      </button>
    </div>
  );
};

export default HomePage;