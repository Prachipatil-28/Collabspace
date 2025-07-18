// src/components/MainContent/CollectionHome.jsx
import React, { useState } from "react";

const CollectionHome = ({ collection }) => {
  const [name, setName] = useState(collection.name);

  const handleSave = () => {
    console.log("Save collection:", name);
    // API call to save
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Collection: {collection.name}</h1>
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

export default CollectionHome;
