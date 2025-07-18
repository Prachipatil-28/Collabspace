import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CODE_TEMPLATES, LANG_VERSIONS } from "./utils/Constant";
import Output from "./Output";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { useParams, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Folder,
  Plus,
  Edit,
  Trash,
  Save,
  Code,
  Settings,
  Menu,
  Brain,
  Loader2,
  Copy,
  Clipboard,
  Users,
} from "lucide-react";
import { javaCompletions } from "./Autocomplete/javaAutoComplete";
import { pythonCompletions } from "./Autocomplete/pythonCompletions";
import { javascriptCompletions } from "./Autocomplete/javascriptCompletions";
import ReactMarkdown from "react-markdown";
import { useMyContext } from "../../../store/ContextApi";
import { debounce } from "lodash";

const EditorWindow = () => {
  const { workspaceId, sessionId } = useParams();
  const location = useLocation();
  const { isCollaborative: initialIsCollaborative = false } = location.state || {};
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [theme, setTheme] = useState("vs-dark");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [renamingItem, setRenamingItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(`${sessionId}/`);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [ws, setWs] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState([]);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [userPermission, setUserPermission] = useState("view");
  const [workspaceType, setWorkspaceType] = useState(null);
  const [isCollaborative, setIsCollaborative] = useState(initialIsCollaborative);
  const [projectOwner, setProjectOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef(null);
  const { currentUser } = useMyContext();

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspace/${workspaceId}`);
        const workspaceData = response.data;
        setWorkspaceType(workspaceData.type);
        setIsOwner(workspaceData.owner === currentUser?.id);
        setIsMember(workspaceData.participants?.includes(currentUser?.email) || false);

        // Fetch project to determine project owner
        const projectResponse = await api.get(`/code/${workspaceId}`);
        const project = projectResponse.data || {};
        setProjectOwner(project.owner || currentUser?.id);

        if (workspaceData.type === "individual") {
          setIsCollaborative(false);
          setUserPermission("edit");
          setPermissions({ [currentUser?.email]: "edit" });
          setMembers([currentUser?.email]);
        } else if (workspaceData.type === "group" || workspaceData.type === "team") {
          if (workspaceData.owner === currentUser?.id) {
            setIsCollaborative(true);
            const initialPermissions = { [currentUser?.email]: "edit" };
            (workspaceData.participants || []).forEach((email) => {
              initialPermissions[email] = workspaceData.permissions?.[email] || "view";
            });
            setPermissions(initialPermissions);
            setUserPermission("edit");
            setMembers(workspaceData.participants || []);
          } else if (project.owner === currentUser?.id) {
            setIsCollaborative(false);
            setUserPermission("edit");
            setPermissions({ [currentUser?.email]: "edit" });
            setMembers([currentUser?.email]);
          } else {
            setIsCollaborative(true);
            setUserPermission(workspaceData.permissions?.[currentUser?.email] || "view");
            setPermissions(workspaceData.permissions || { [currentUser?.email]: "view" });
            setMembers(workspaceData.participants || []);
          }
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace.");
      }
    };

    const loadCode = async () => {
      try {
        const response = await api.get(`/code/${workspaceId}`);
        const allFiles = Array.isArray(response.data.files) ? response.data.files : [];
        const folderFiles = allFiles.filter(
          (f) => f.name.startsWith(currentFolder) && !f.name.endsWith("/")
        );

        setFiles(folderFiles);
        if (folderFiles.length > 0) {
          setSelectedFile(folderFiles[0]);
          setCode(folderFiles[0].content || "");
          setLanguage(getLanguageFromExtension(folderFiles[0].name));
        } else {
          setCode("");
        }
      } catch (error) {
        console.error("Error loading code:", error);
        toast.error("Failed to load files.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
    loadCode();

    if (isCollaborative) {
      const websocket = new WebSocket(`ws://192.168.231.184:8080/ws/workspace/${workspaceId}`);
      websocket.onopen = () => {
        console.log("WebSocket connected for session:", sessionId);
      };
      websocket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "CODE_UPDATE" && message.fileName === selectedFile?.name) {
            if (message.userId !== currentUser?.id) {
              setCode(message.content);
              toast.info(`Code updated by ${message.userId}`);
            }
          } else if (message.type === "PERMISSION_UPDATE") {
            // Fetch workspace to get latest participants
            const response = await api.get(`/workspace/${workspaceId}`);
            const workspaceData = response.data;
            setPermissions(message.data);
            setUserPermission(message.data[currentUser?.email] || "view");
            setMembers(workspaceData.participants || []);
            toast.success("Permissions updated!");
          } else if (message.type === "CONTENT_PUBLISHED") {
            toast.success(`New content published by ${message.userId}`);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
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
    }
  }, [workspaceId, sessionId, currentFolder, currentUser, isCollaborative]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const completions = {
          javascript: javascriptCompletions,
          python: pythonCompletions,
          java: javaCompletions,
          typescript: javascriptCompletions,
        }[language] || [];
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = completions
          .filter((item) => item.label && item.insertText)
          .map((item) => ({
            label: item.label,
            kind: item.kind || monaco.languages.CompletionItemKind.Snippet,
            insertText: item.insertText,
            detail: item.detail || "",
            range,
          }));
        return { suggestions };
      },
    });
  };

  const handlePublish = async () => {
    if (!isCollaborative || isOwner) {
      toast.error("Publish is only for non-owner participants in collaborative mode.");
      return;
    }
    try {
      const response = await api.get(`/code/${workspaceId}`);
      const allFiles = response.data.files || [];

      const updatedFiles = allFiles.map((file) => {
        if (file.name === selectedFile?.name) {
          return { ...file, content: code, isPublished: true };
        }
        return file;
      });

      const payload = {
        workspaceId,
        files: updatedFiles,
        code: "",
        language: language,
        owner: projectOwner,
      };

      await api.post("/code/save", payload);
      toast.success("Content published! The owner has been notified.");

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "CONTENT_PUBLISHED",
            fileName: selectedFile?.name,
            userId: currentUser?.id,
            workspaceId,
            sessionId,
          })
        );
      }
    } catch (error) {
      console.error("Error publishing content:", error);
      toast.error("Failed to publish content.");
    }
  };

  const getLanguageFromExtension = (fileName) => {
    const ext = fileName.split(".").pop();
    return { js: "javascript", ts: "typescript", py: "python", java: "java" }[ext] || "javascript";
  };

  const getLanguageIcon = (fileName) => {
    const ext = fileName.split(".").pop();
    switch (ext) {
      case "java":
        return <Code size={16} className="text-red-400" />;
      case "py":
        return <Code size={16} className="text-blue-400" />;
      case "js":
        return <Code size={16} className="text-yellow-400" />;
      case "ts":
        return <Code size={16} className="text-blue-600" />;
      default:
        return <Code size={16} className="text-green-400" />;
    }
  };

  const addFile = async () => {
    if (workspaceType !== "individual" && isCollaborative && !isOwner) {
      toast.error("Only the project owner can create files in collaborative mode.");
      return;
    }
    if (!newFileName) {
      toast.error("File name is required.");
      return;
    }
    const fullName = `${currentFolder}${newFileName}`;
    if (files.some((f) => f.name === fullName)) {
      toast.error("File name already exists in this folder.");
      return;
    }
    const lang = getLanguageFromExtension(newFileName);
    const newFile = { name: fullName, content: CODE_TEMPLATES[lang] || "" };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setSelectedFile(newFile);
    setCode(newFile.content);
    setLanguage(lang);
    setNewFileName("");
    await saveCode(updatedFiles);
    toast.success(`Created ${fullName}`);
  };

  const deleteItem = async (item) => {
    if (workspaceType !== "individual" && isCollaborative && !isOwner) {
      toast.error("Only the project owner can delete files in collaborative mode.");
      return;
    }
    const updatedFiles = files.filter((f) => f.name !== item.name);
    setFiles(updatedFiles);
    if (selectedFile?.name === item.name) {
      setSelectedFile(null);
      setCode("");
    }
    await saveCode(updatedFiles);
    toast.success(`Deleted ${item.name}`);
  };

  const startRenaming = (item) => {
    if (workspaceType !== "individual" && isCollaborative && !isOwner) {
      toast.error("Only the project owner can rename files in collaborative mode.");
      return;
    }
    setRenamingItem(item);
    setNewFileName(item.name.split("/").pop());
  };

  const handleRename = async () => {
    if (workspaceType !== "individual" && isCollaborative && !isOwner) {
      toast.error("Only the project owner can rename files in collaborative mode.");
      return;
    }
    if (!newFileName) {
      toast.error("Name cannot be empty.");
      return;
    }
    const newName = `${currentFolder}${newFileName}`;
    if (files.some((f) => f.name === newName && f !== renamingItem)) {
      toast.error("Name already exists.");
      return;
    }
    const updatedFiles = files.map((f) =>
      f === renamingItem ? { ...f, name: newName } : f
    );
    setFiles(updatedFiles);
    if (selectedFile === renamingItem) {
      setSelectedFile({ ...selectedFile, name: newName });
    }
    setRenamingItem(null);
    await saveCode(updatedFiles);
    toast.success(`Renamed to ${newName}`);
  };

  const saveCode = async (updatedFiles = files) => {
    try {
      if (!Array.isArray(updatedFiles)) {
        console.error("updatedFiles is not an array:", updatedFiles);
        toast.error("Failed to save: Invalid file data.");
        return;
      }

      const finalFiles = updatedFiles.map((f) =>
        f === selectedFile ? { ...f, content: code } : f
      );
      const response = await api.get(`/code/${workspaceId}`);
      const allFiles = Array.isArray(response.data.files) ? response.data.files : [];
      const nonFolderFiles = allFiles.filter((f) => !f.name.startsWith(currentFolder));
      const payload = {
        workspaceId,
        files: [...nonFolderFiles, ...finalFiles, { name: currentFolder, content: "Folder" }],
        code: "",
        language: "javascript",
        owner: projectOwner,
      };
      await api.post("/code/save", payload);
      setFiles(finalFiles);
      toast.success("Changes saved!");
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Failed to save code.");
    }
  };

  const broadcastCodeUpdate = debounce(() => {
    if (
      ws &&
      ws.readyState === WebSocket.OPEN &&
      selectedFile &&
      (workspaceType === "individual" || userPermission === "edit")
    ) {
      ws.send(
        JSON.stringify({
          type: "CODE_UPDATE",
          fileName: selectedFile.name,
          content: code,
          userId: currentUser?.id,
          workspaceId,
          sessionId,
        })
      );
    }
  }, 300);

  const validatePermission = () => {
    if (workspaceType !== "individual" && userPermission !== "edit") {
      toast.error("You do not have edit permissions.");
      return false;
    }
    return true;
  };

  const handleCodeChange = (newCode) => {
    if (validatePermission()) {
      setCode(newCode);
      if (isCollaborative) {
        broadcastCodeUpdate();
      }
    }
  };

  const executeCode = async () => {
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version: LANG_VERSIONS[language],
          files: [{ content: code }],
        }),
      });
      const result = await response.json();
      return result.run.output || "No output.";
    } catch (error) {
      console.error("Error executing code:", error);
      return "Error executing code.";
    }
  };

  const generateAICode = async () => {
    if (!aiPrompt) {
      toast.error("Please enter a prompt.");
      return;
    }
    setIsAILoading(true);
    setIsAIModalOpen(true);
    try {
      const response = await api.post("/ai/generate", {
        prompt: aiPrompt,
        language: language,
      });
      const content = response.data.content;
      setAiResponse(content);
    } catch (error) {
      console.error("[AI Error] Failed to generate AI code:", error);
      setAiResponse(`Failed to generate code: ${error.response?.data?.content || error.message}`);
    } finally {
      setIsAILoading(false);
    }
  };

  const copyCodeToEditor = () => {
    if (!validatePermission()) return;
    const codeMatch = aiResponse.match(new RegExp(`\`\`\`${language}\n([\\s\\S]*?)\n\`\`\``));
    if (codeMatch && codeMatch[1]) {
      const newCode = code ? `${code}\n\n${codeMatch[1]}` : codeMatch[1];
      setCode(newCode);
      if (isCollaborative) {
        broadcastCodeUpdate();
      }
      toast.success("Code added to editor!");
      setIsAIModalOpen(false);
    } else {
      toast.error("No code found in AI response.");
    }
  };

  const copyCode = () => {
    const codeMatch = aiResponse.match(new RegExp(`\`\`\`${language}\n([\\s\\S]*?)\n\`\`\``));
    if (codeMatch && codeMatch[1]) {
      navigator.clipboard.writeText(codeMatch[1]);
      toast.success("Code copied to clipboard!");
    } else {
      toast.error("No code found to copy.");
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(aiResponse);
    toast.success("Full response copied to clipboard!");
  };

  const updateMemberPermission = async (userEmail, permission) => {
    if (workspaceType === "individual") {
      toast.info("Permissions are not applicable for individual workspaces.");
      return;
    }
    if (!isOwner) {
      toast.error("Only the workspace owner can update permissions.");
      return;
    }
    if (!members.includes(userEmail)) {
      toast.error(`User ${userEmail} is not a participant of this workspace.`);
      return;
    }
    try {
      const updatedPermissions = { ...permissions, [userEmail]: permission };
      const response = await api.post(`/workspace/${workspaceId}/permissions`, updatedPermissions);
      const { permissions: newPermissions, skippedUsers } = response.data;
      setPermissions(newPermissions);
      if (skippedUsers.length > 0) {
        toast.warn(`Skipped permission updates for: ${skippedUsers.join(", ")}`);
      }
      // Fetch latest participants to ensure members is up-to-date
      const workspaceResponse = await api.get(`/workspace/${workspaceId}`);
      setMembers(workspaceResponse.data.participants || []);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "PERMISSION_UPDATE",
            data: newPermissions,
            workspaceId,
            sessionId,
          })
        );
      }
      toast.success("Permission updated!");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions.");
    }
  };

  const getInitials = (email) => {
    if (!email) return "?";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.map((p) => p[0]).join("").toUpperCase().substring(0, 2);
  };

  const renderAIResponse = () => {
    const codeMatch = aiResponse.match(new RegExp(`\`\`\`${language}\n([\\s\\S]*?)\n\`\`\``));
    const explanation = codeMatch ? aiResponse.split(codeMatch[0])[0] : aiResponse;
    const codeSnippet = codeMatch ? codeMatch[1] : "";

    return (
      <>
        <div className="prose max-w-none text-gray-900">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
        {codeSnippet && (
          <div className="mt-4">
            <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        )}
      </>
    );
  };

  const folderFiles = files.filter((f) => f.name.startsWith(currentFolder) && !f.name.endsWith("/"));

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex overflow-hidden font-sans p-4">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-0"} overflow-hidden shadow-lg rounded-lg`}
      >
        <div className="p-4 w-72">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Folder size={20} className="text-blue-400" />
              <span className="text-lg font-semibold">{currentFolder.slice(0, -1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addFile()}
              placeholder="e.g., hello.java"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={workspaceType !== "individual" && isCollaborative && !isOwner}
            />
            <button
              onClick={addFile}
              className="text-gray-400 hover:text-white bg-gray-700 p-2 rounded-lg hover:bg-gray-600 mr-4"
              disabled={workspaceType !== "individual" && isCollaborative && !isOwner}
            >
              <Plus size={20} />
            </button>
          </div>
          <ul className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
            {folderFiles.map((file) => (
              <li
                key={file.name}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  selectedFile?.name === file.name ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                {renamingItem === file ? (
                  <input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={handleRename}
                    onKeyPress={(e) => e.key === "Enter" && handleRename()}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <span
                      onClick={() => {
                        setSelectedFile(file);
                        setCode(file.content || "");
                        setLanguage(getLanguageFromExtension(file.name));
                      }}
                      className="flex items-center gap-2"
                    >
                      {getLanguageIcon(file.name)}
                      {file.name.slice(currentFolder.length)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startRenaming(file)}
                        className="text-gray-400 hover:text-white"
                        disabled={workspaceType !== "individual" && isCollaborative && !isOwner}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(file)}
                        className="text-gray-400 hover:text-red-400"
                        disabled={workspaceType !== "individual" && isCollaborative && !isOwner}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-300 hover:text-white">
              {isSidebarOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
            </button>
            <Code size={20} className="text-blue-400" />
            <span className="text-lg font-medium">
              {selectedFile ? selectedFile.name.slice(currentFolder.length) : "No File Selected"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                if (!selectedFile) setCode(CODE_TEMPLATES[e.target.value] || "");
              }}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </select>
            <button
              onClick={() => saveCode()}
              className="flex items-center gap-2 text-gray-300 hover:text-white bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 transition-all"
              disabled={isLoading || (workspaceType !== "individual" && userPermission !== "edit")}
            >
              <Save size={16} /> Save
            </button>
            {isCollaborative && !isOwner && userPermission === "edit" && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 text-gray-300 hover:text-white bg-green-600 px-3 py-1 rounded-lg hover:bg-green-700 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Publish
              </button>
            )}
            <button
              onClick={generateAICode}
              className="flex items-center gap-2 text-gray-300 hover:text-white bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
              disabled={isAILoading}
            >
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {isAILoading ? "Generating..." : "Generate Code"}
            </button>
            {isCollaborative && isOwner && (
              <button
                onClick={() => setIsPermissionsModalOpen(true)}
                className="flex items-center gap-2 text-gray-300 hover:text-white bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 transition-all"
              >
                <Users size={16} /> Manage Permissions
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="text-gray-300 hover:text-white p-1"
              >
                <Settings size={20} />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-600 p-4">
                  <h3 className="text-lg font-semibold mb-2">Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value);
                          if (!selectedFile) setCode(CODE_TEMPLATES[e.target.value] || "");
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="typescript">TypeScript</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Theme</label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor and AI Modal */}
        <PanelGroup direction="vertical" className="flex-1 p-4">
          <Panel defaultSize={70} minSize={20}>
            <div className="h-full w-full bg-gray-900 rounded-lg">
              <Editor
                height="100%"
                width="100%"
                language={language}
                theme={theme}
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorMount}
                options={{
                  fontSize: 16,
                  minimap: { enabled: true },
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 10, bottom: 10 },
                  readOnly: workspaceType !== "individual" && userPermission !== "edit",
                }}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="h-1 bg-gray-700 cursor-ns-resize hover:bg-blue-500 transition-all" />
          <Panel minSize={10}>
            <div className="flex items-center gap-2 mb-2">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., How to add a list in Python"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAILoading}
              />
              <button
                onClick={generateAICode}
                className="text-gray-300 hover:text-white bg-gray-700 p-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                disabled={isAILoading}
              >
                {isAILoading ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />}
              </button>
            </div>
            <Output executeCode={executeCode} />
          </Panel>
        </PanelGroup>

        {/* AI Modal */}
        {isAIModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Brain size={24} className="text-blue-600" /> AI Generated Response
                </h3>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Prompt</label>
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAILoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAILoading}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="typescript">TypeScript</option>
                </select>
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
                      onClick={copyCodeToEditor}
                      className="flex items-center gap-2 text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-all"
                      disabled={workspaceType !== "individual" && userPermission !== "edit"}
                    >
                      <Plus size={16} /> Add to Code
                    </button>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-2 text-gray-700 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      <Copy size={16} /> Copy Code
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

        {/* Permissions Modal */}
        {isPermissionsModalOpen && isCollaborative && isOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Users size={24} className="text-blue-600" /> Manage Permissions
                </h3>
                <button
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {getInitials(member)}
                      </div>
                      <span>{member}</span>
                    </div>
                    <select
                      value={permissions[member] || "view"}
                      onChange={(e) => updateMemberPermission(member, e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded-lg px-2 py-1"
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorWindow;