// src/components/CreateSessionForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/api";

const CreateSessionForm = ({activeWorkspace ,onClose, refreshSessions }) => {
  
  const [sessionType, setSessionType] = useState("private");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  

  const { register, handleSubmit, reset } = useForm();

  // Mock list of users (replace with API call)
  const allUsers = [
    { userId: "1", name: "Alice" },
    { userId: "2", name: "Bob" },
    { userId: "3", name: "Charlie" },
  ];

  const onSubmit = async (data) => {
    console.log(workspaceId);
    const newSession = {
      name: data.name,
      type: sessionType,
      startDate: data.startDate,
      endDate: data.endDate,
      participantsId: selectedParticipants.map((user) => user.userId),
    };

    try {
      await api.post(`/session/${activeWorkspace}`, newSession);
      alert("Session created successfully!");
      reset();
      onClose();
      refreshSessions();
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Session Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Session Name</label>
        <input
          {...register("name", { required: "Session name is required" })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Session Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Session Type</label>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="private">Private 🔒</option>
          <option value="public">Public 🌐</option>
          <option value="team">Team 👥</option>
        </select>
      </div>

      {/* Participants (for public and team sessions) */}
      {sessionType !== "private" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Participants</label>
          <div className="flex flex-wrap space-x-2 mb-2">
            {selectedParticipants.map((participant) => (
              <span
                key={participant.userId}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {participant.name}
                <button
                  onClick={() =>
                    setSelectedParticipants(
                      selectedParticipants.filter((p) => p.userId !== participant.userId)
                    )
                  }
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <ul className="max-h-32 overflow-y-auto border border-gray-300 rounded-md mt-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li
                  key={user.userId}
                  onClick={() => setSelectedParticipants([...selectedParticipants, user])}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {user.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No user found</li>
            )}
          </ul>
        </div>
      )}

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          {...register("startDate", { required: "Start date is required" })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          {...register("endDate", { required: "End date is required" })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Session
      </button>
    </form>
  );
};

export default CreateSessionForm;