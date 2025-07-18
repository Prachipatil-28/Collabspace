// src/components/WorkspaceDetail.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { AppContext } from "../../store/AppContext";
import useWebSocket from "../../hooks/websocketHook";
import { Editor } from "@monaco-editor/react";
import Excalidraw from "@excalidraw/excalidraw";

const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const { activeWorkspace, setActiveWorkspace, sessions, setSessions } = useContext(AppContext);
  const [workspace, setWorkspace] = useState(null);
  const [newSession, setNewSession] = useState({ title: "", description: "", startTime: "", endTime: "" });
  const [participants, setParticipants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tool, setTool] = useState("editor"); // editor, whiteboard, notepad
  const [editMode, setEditMode] = useState(false);
  const owner = localStorage.getItem("username");
  const isOwner = workspace?.owner === owner;

  const { messages, toolContent, sendToolUpdate, sendMessage } = useWebSocket(workspaceId);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        setWorkspace(response.data);
        setActiveWorkspace(response.data);
        setParticipants(response.data.participants);
      } catch (error) {
        console.error("Error fetching workspace:", error);
      }
    };
    fetchWorkspace();
  }, [workspaceId]);

  const createSession = async () => {
    const sessionData = {
      ...newSession,
      workspaceId,
      duration: (new Date(newSession.endTime) - new Date(newSession.startTime)) / (1000 * 60), // in minutes
      participants: participants.filter((p) => p !== owner),
    };
    try {
      const response = await api.post("/session/create", sessionData);
      setSessions([...sessions, response.data]);
      setNewSession({ title: "", description: "", startTime: "", endTime: "" });
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const assignTask = async (sessionId, participant, taskDescription) => {
    try {
      const response = await api.post(`/session/${sessionId}/task`, { participant, description: taskDescription });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };

  const removeParticipant = async (participant) => {
    try {
      await api.post(`/workspace/${workspaceId}/remove`, { participant });
      setParticipants(participants.filter((p) => p !== participant));
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  const toggleEditMode = () => setEditMode(!editMode);

  if (!workspace) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">{workspace.workspaceName}</h1>
      <p>{workspace.workspaceDescription}</p>
      <p>Type: {workspace.type}</p>

      {isOwner && workspace.type !== "individual" && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Owner Dashboard</h2>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Add participant"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  api.post(`/workspace/${workspaceId}/add`, { participant: e.target.value });
                  setParticipants([...participants, e.target.value]);
                  e.target.value = "";
                }
              }}
              className="border p-2 rounded"
            />
            <ul>
              {participants.map((p) => (
                <li key={p}>
                  {p}{" "}
                  <button
                    onClick={() => removeParticipant(p)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3>Create Session</h3>
            <input
              type="text"
              placeholder="Title"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={newSession.description}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <input
              type="datetime-local"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <input
              type="datetime-local"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <button onClick={createSession} className="bg-blue-500 text-white p-2 rounded">
              Create
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Sessions</h2>
        {sessions.map((session) => (
          <div key={session.sessionId} className="border p-4 mb-2 rounded">
            <h3>{session.title}</h3>
            <p>{session.description}</p>
            <p>
              {session.startTime} - {session.endTime} ({session.duration} mins)
            </p>
            {isOwner && (
              <div>
                <button onClick={toggleEditMode} className="text-blue-500">
                  {editMode ? "Disable Edit" : "Enable Edit"}
                </button>
                <input
                  type="text"
                  placeholder="Assign task"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      assignTask(session.sessionId, participants[0], e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="border p-2 rounded mr-2"
                />
              </div>
            )}

            <div className="mt-2">
              <button onClick={() => setTool("editor")}>Editor</button>
              <button onClick={() => setTool("whiteboard")}>Whiteboard</button>
              <button onClick={() => setTool("notepad")}>Notepad</button>
            </div>

            {tool === "editor" && (
              <Editor
                height="400px"
                defaultLanguage="javascript"
                value={toolContent}
                onChange={(value) => editMode && sendToolUpdate("editor", value)}
                options={{ readOnly: !editMode }}
              />
            )}
            {tool === "whiteboard" && (
              <div style={{ height: "400px" }}>
                <Excalidraw
                  onChange={(elements) =>
                    editMode && sendToolUpdate("whiteboard", JSON.stringify(elements))
                  }
                />
              </div>
            )}
           

            <div className="mt-2">
              <h4>Chat</h4>
              <ul>
                {messages.map((msg, idx) => (
                  <li key={idx}>
                    {msg.sender}: {msg.content}
                  </li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Type a message"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(owner, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="border p-2 rounded"
              />
            </div>

            <div className="mt-2">
              <h4>Tasks</h4>
              <ul>
                {tasks
                  .filter((t) => t.sessionId === session.sessionId)
                  .map((task) => (
                    <li key={task.taskId}>
                      {task.participant}: {task.description}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceDetail;