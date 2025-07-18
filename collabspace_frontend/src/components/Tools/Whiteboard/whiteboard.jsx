import React, { useRef, useState, useEffect, forwardRef } from "react";
import { Excalidraw as ExcalidrawBase, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Brain, Loader2, Copy, Clipboard } from "lucide-react";
import ReactMarkdown from "react-markdown";

const Excalidraw = forwardRef((props, ref) => (
  <ExcalidrawBase
    ref={ref}
    {...props}
    onMount={() => props.onMount && props.onMount(ref)}
  />
));

const Whiteboard = ({ isCollaborative = true }) => {
  const { workspaceId, sessionId, boardName } = useParams();
  const [elements, setElements] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [ws, setWs] = useState(null);
  const excalidrawRef = useRef(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const response = await api.get(`/whiteboard/${workspaceId}/${sessionId}/${boardName}`);
        const boardData = response.data.board || { elements: [] };
        setElements(boardData.elements);
        if (isCanvasReady && excalidrawRef.current) {
          excalidrawRef.current.updateScene({ elements: boardData.elements });
        }
      } catch (error) {
        console.error("Error loading board:", error);
        toast.error("Failed to load whiteboard.");
      }
    };
    loadBoard();

    // Initialize WebSocket
    const websocket = new WebSocket(`ws://localhost:8080/ws/session/${sessionId}`);
    websocket.onopen = () => {
      console.log("WebSocket connected for session:", sessionId);
    };
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "WHITEBOARD_UPDATE" && excalidrawRef.current) {
        const newElements = message.elements;
        setElements(newElements);
        excalidrawRef.current.updateScene({ elements: newElements });
      }
    };
    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [workspaceId, sessionId, boardName, isCanvasReady]);

  const handleCanvasReady = (ref) => {
    setIsCanvasReady(true);
  };

  const saveBoard = async () => {
    try {
      if (!isCanvasReady || !excalidrawRef.current) {
        toast.error("Canvas not ready for saving.");
        return;
      }
      const currentElements = excalidrawRef.current.getSceneElements() || [];
      const payload = { workspaceId, sessionId, boardName, elements: currentElements };
      await api.post("/whiteboard/save", payload);
      setElements(currentElements);
      toast.success("Whiteboard saved!");
    } catch (error) {
      console.error("Error saving board:", error);
      toast.error("Failed to save whiteboard.");
    }
  };

  const handleChange = (newElements) => {
    setElements(newElements);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "WHITEBOARD_UPDATE",
        elements: newElements,
      }));
    }
  };

  const generateAIDiagram = async () => {
    if (!aiPrompt) {
      toast.error("Please enter a prompt.");
      return;
    }
    setIsAILoading(true);
    setIsAIModalOpen(true);
    try {
      const response = await api.post("/ai/generate-diagram", { prompt: aiPrompt });
      const content = response.data.content;
      setAiResponse(content);
      const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/);
      if (mermaidMatch && mermaidMatch[1]) {
        toast.success("Mermaid diagram generated! Copy it to render elsewhere.");
      } else {
        toast.error("No valid Mermaid code found in AI response.");
      }
    } catch (error) {
      console.error("[AI Error] Failed to generate AI diagram:", error);
      setAiResponse(`Failed to generate diagram: ${error.response?.data?.content || error.message}`);
      toast.error("Failed to generate diagram due to server error.");
    } finally {
      setIsAILoading(false);
    }
  };

  const copyDiagram = () => {
    const mermaidMatch = aiResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    if (mermaidMatch && mermaidMatch[1]) {
      navigator.clipboard.writeText(mermaidMatch[1]);
      toast.success("Mermaid code copied to clipboard!");
    } else {
      toast.error("No Mermaid code found to copy.");
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(aiResponse);
    toast.success("Full response copied to clipboard!");
  };

  const renderAIResponse = () => {
    const mermaidMatch = aiResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    const explanation = mermaidMatch ? aiResponse.split(mermaidMatch[0])[0] : aiResponse;
    const mermaidCode = mermaidMatch ? mermaidMatch[1] : "";

    return (
      <>
        <div className="prose max-w-none text-gray-900">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
        {mermaidCode && (
          <div className="mt-4">
            <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto">
              <code>{mermaidCode}</code>
            </pre>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="flex-1">
        <Excalidraw
          ref={excalidrawRef}
          initialData={{ elements }}
          onChange={handleChange}
          onMount={handleCanvasReady}
          UIOptions={{
            canvasActions: { loadScene: false },
          }}
        >
          <MainMenu>
            <MainMenu.Item onSelect={saveBoard}>
              Save Whiteboard
            </MainMenu.Item>
            <MainMenu.Item onSelect={() => setIsAIModalOpen(true)}>
              Generate AI Diagram
            </MainMenu.Item>
          </MainMenu>
          {!boardName && <WelcomeScreen />}
        </Excalidraw>
      </div>

      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Brain size={24} className="text-blue-600" /> AI Generated Diagram
              </h3>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prompt</label>
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && generateAIDiagram()}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Create a simple flowchart"
                disabled={isAILoading}
              />
            </div>
            {isAILoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 text-lg">Generating...</span>
              </div>
            ) : (
              <>
                {renderAIResponse()}
                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={copyDiagram}
                    className="flex items-center gap-2 text-gray-700 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    <Copy size={16} /> Copy Mermaid Code
                  </button>
                  <button
                    onClick={copyAll}
                    className="flex items-center gap-2 text-gray-700 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    <Clipboard size={16} /> Copy All
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;