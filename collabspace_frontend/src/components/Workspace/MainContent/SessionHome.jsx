// src/components/MainContent/SessionHome.jsx
import React, { useState } from "react";

const SessionHome = ({ session }) => {
  const [name, setName] = useState(session.name);

  const handleSave = () => {
    console.log("Save session:", name);
    // API call to save
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Session: {session.name}</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-2 py-1"
      />
      <button onClick={handleSave} className="ml-2 px-4 py-2 bg-blue-500">
        Save
      </button>
    </div>
  );
};

export default SessionHome;
