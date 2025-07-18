// src/pages/SessionPage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "../../../hooks/websocketHook";

const SessionPage = () => {
  const { sessionId } = useParams();
  const { messages, toolContent, sendToolUpdate, sendMessage } = useWebSocket(sessionId);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    const sender = localStorage.getItem("username") || "Guest";
    sendMessage(sender, inputValue);
    setInputValue("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Session Details</h1>

      
      <div className="mb-4">
        <h2 className="text-lg font-bold">Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className="bg-gray-100 p-2 rounded mb-2">
              <strong>{msg.sender}:</strong> {msg.content}
            </li>
          ))}
        </ul>
      </div>

      
      <div className="mb-4">
        <h2 className="text-lg font-bold">Collaborative Tools</h2>
        <textarea
          value={toolContent}
          onChange={(e) => sendToolUpdate("code-editor", e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Send Message */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SessionPage;