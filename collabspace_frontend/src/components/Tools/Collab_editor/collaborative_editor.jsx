import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  ySyncPlugin,
  yCursorPlugin,
  yUndoPlugin,
} from "y-prosemirror";

import { db } from "../../../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef();

  const insertLocalImage = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) insertLocalImage(file);
  };

  if (!editor) return null;

  return (
    <div className="shadow-md rounded-md p-2 flex space-x-2 bg-gray-100">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="toolbar-btn rounded px-2 py-1 text-sm font-bold hover:bg-gray-200"
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="toolbar-btn rounded px-2 py-1 text-sm italic hover:bg-gray-200"
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="toolbar-btn rounded px-2 py-1 text-sm underline hover:bg-gray-200"
      >
        U̲
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        •
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        🖼
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        ⬅
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        ↔
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        ➡
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        ↶
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="toolbar-btn rounded px-2 py-1 text-sm hover:bg-gray-200"
      >
        ↷
      </button>
    </div>
  );
};

const CollaborativeEditor = () => {
  const [loading, setLoading] = useState(true);
  const [newDocId, setNewDocId] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [allDocs, setAllDocs] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      BulletList,
      ListItem,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
    ],
    content: "<p>Start writing...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none",
      },
    },
    onCreate: ({ editor }) => {
      const ydoc = new Y.Doc();
      const provider = new WebsocketProvider(
        "wss://demos.yjs.dev",
        currentDocId || "temp-doc",
        ydoc
      );
      const yXmlFragment = ydoc.getXmlFragment("prosemirror");

      editor.registerPlugin(ySyncPlugin(yXmlFragment));
      editor.registerPlugin(yCursorPlugin(provider.awareness));
      editor.registerPlugin(yUndoPlugin());
    },
  });

  const loadAllDocs = async () => {
    const querySnapshot = await getDocs(collection(db, "documents"));
    const docs = [];
    querySnapshot.forEach((doc) => docs.push(doc.id));
    setAllDocs(docs);
  };

  const loadDocument = async (id) => {
    setCurrentDocId(id);
    const docRef = doc(db, "documents", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      editor.commands.setContent(docSnap.data().content || "<p></p>");
    }
  };

  const createNewDocument = async () => {
    if (!newDocId || !newDocContent) {
      alert("Please enter both name and content.");
      return;
    }

    await setDoc(doc(db, "documents", newDocId), {
      content: newDocContent,
      updatedAt: new Date(),
    });

    alert("New document created!");
    setNewDocId("");
    setNewDocContent("");
    loadAllDocs();
  };

  const saveEditedDocument = async () => {
    if (!currentDocId || !editor) {
      alert("No document loaded to save.");
      return;
    }

    const content = editor.getHTML();

    await setDoc(doc(db, "documents", currentDocId), {
      content: content,
      updatedAt: new Date(),
    });

    alert("Changes saved to cloud!");

    loadDocument(currentDocId);
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    await deleteDoc(doc(db, "documents", id));
    alert("Document deleted!");
    if (id === currentDocId) {
      editor.commands.clearContent();
      setCurrentDocId(null);
    }
    loadAllDocs();
  };

  useEffect(() => {
    loadAllDocs();
    setLoading(false);
  }, []);

  if (loading || !editor) return <p className="p-4 text-gray-600">Loading editor...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-md shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">📝 Collaborative Editor</h2>
        </div>

        <div className="p-4">
          <div className="mb-4 flex space-x-2">
            <input
              value={newDocId}
              onChange={(e) => setNewDocId(e.target.value)}
              placeholder="Document Name"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <textarea
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              placeholder="Initial Content"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md h-12 resize-none"
            />
            <button
              onClick={createNewDocument}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ➕ Create
            </button>
          </div>

          <MenuBar editor={editor} />
          <div className="mt-2">
            <EditorContent editor={editor} className="mt-4 bg-white rounded-md border border-gray-300 p-4 focus:outline-none" />
          </div>

          {currentDocId && (
            <div className="mt-4">
              <button
                onClick={saveEditedDocument}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                💾 Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📁 Documents</h3>
          <ul>
            {allDocs.map((id) => (
              <li key={id} className="py-2 flex items-center justify-between">
                <span className="text-gray-600">{id}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => loadDocument(id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteDocument(id)}
                    className="inline-flex items-center px-3 py-1 border border-red-500 rounded-md shadow-sm text-red-500 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {allDocs.length === 0 && <p className="text-gray-500 text-sm italic">No documents created yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;