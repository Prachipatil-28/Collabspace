// src/components/Tools/CodeEditor/Output.jsx
import React, { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Output = ({ executeCode }) => {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const result = await executeCode();
      setOutput(result);
      toast.success("Code executed successfully!");
    } catch (err) {
      setError("Error executing code.");
      toast.error("Failed to execute code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Output</h3>
        <button
          onClick={runCode}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
          Run Code
        </button>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto font-mono text-sm">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <pre className="text-gray-200 whitespace-pre-wrap">{output || "Click 'Run Code' to see output."}</pre>
        )}
      </div>
    </div>
  );
};

export default Output;