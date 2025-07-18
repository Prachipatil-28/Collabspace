import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Draggable from "react-draggable";
import toast from "react-hot-toast";
import api from "../../../api/api";
import { useMyContext } from "../../../store/ContextApi.jsx";
import { useTheme } from "../../../store/ThemeProvider.jsx";
import { v4 as uuidv4 } from "uuid";

const Publish = () => {
  const { currentUser } = useMyContext();
  const { darkMode } = useTheme();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [imagePositions, setImagePositions] = useState({});
  const [imageSizes, setImageSizes] = useState({});
  const [imageDataMap, setImageDataMap] = useState({}); // Maps image IDs to base64 data
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || { id: null };

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"],
              ["image", "link"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["clean"],
            ],
            handlers: {
              image: () => {
                fileInputRef.current.click(); // Trigger file input
              },
            },
          },
        },
      });

      // Handle image upload
      const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size must be less than 5MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result;
            const imageId = uuidv4(); // Unique ID for the image
            const range = quillRef.current.getSelection();
            if (range) {
              quillRef.current.insertEmbed(range.index, "image", base64);
              setImageDataMap((prev) => ({
                ...prev,
                [imageId]: base64,
              }));
              setImagePositions((prev) => ({
                ...prev,
                [imageId]: { x: 0, y: 0 },
              }));
              setImageSizes((prev) => ({
                ...prev,
                [imageId]: { width: 200, height: 200 },
              }));
            }
          };
          reader.readAsDataURL(file);
        } else {
          toast.error("Please select a valid image file.");
        }
        // Reset file input
        event.target.value = null;
      };

      fileInputRef.current.addEventListener("change", handleImageUpload);

      // Update image styles on text change
      quillRef.current.on("text-change", () => {
        const images = editorRef.current.querySelectorAll(".ql-editor img");
        images.forEach((img) => {
          const src = img.src;
          const imageId = Object.keys(imageDataMap).find(
            (id) => imageDataMap[id] === src
          );
          if (imageId) {
            img.style.position = "absolute";
            img.style.left = `${imagePositions[imageId]?.x || 0}px`;
            img.style.top = `${imagePositions[imageId]?.y || 0}px`;
            img.style.width = `${imageSizes[imageId]?.width || 200}px`;
            img.style.height = `${imageSizes[imageId]?.height || 200}px`;
            img.setAttribute("data-image-id", imageId);
            img.setAttribute("draggable", "false");
          }
        });
      });

      return () => {
        if (fileInputRef.current) {
          fileInputRef.current.removeEventListener("change", handleImageUpload);
        }
        if (quillRef.current) {
          quillRef.current = null;
        }
      };
    }
  }, [imageDataMap, imagePositions, imageSizes]);

  // Update dark mode styles
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.querySelector(".ql-container");
      const toolbar = editorRef.current.querySelector(".ql-toolbar");
      if (editor && toolbar) {
        if (darkMode) {
          editor.classList.add("ql-dark");
          toolbar.classList.add("ql-dark");
        } else {
          editor.classList.remove("ql-dark");
          toolbar.classList.remove("ql-dark");
        }
      }
    }
  }, [darkMode]);

  // Handle drag stop
  const handleDragStop = (imageId, e, data) => {
    setImagePositions((prev) => ({
      ...prev,
      [imageId]: { x: data.x, y: data.y },
    }));
    // Trigger text-change to update styles
    quillRef.current.emitter.emit("text-change");
  };

  // Handle resize stop
  const handleResizeStop = (imageId, e, data) => {
    setImageSizes((prev) => ({
      ...prev,
      [imageId]: { width: data.size.width, height: data.size.height },
    }));
    // Trigger text-change to update styles
    quillRef.current.emitter.emit("text-change");
  };

  // Publish content
  const onSubmit = async (data) => {
    if (!currentUser?.id && !user.id) {
      toast.error("Please log in to publish content.");
      return;
    }

    const content = quillRef.current.root.innerHTML;
    const payload = {
      title: data.title,
      body: content,
      userId: currentUser?.id,
      createdDate: new Date().toISOString(), 
    };

    try {
      await api.post("api/content/create", payload);
      toast.success("Content published successfully!");
      reset();
      quillRef.current.setContents([]);
      setImagePositions({});
      setImageSizes({});
      setImageDataMap({});
    } catch (error) {
      console.error("Error publishing content:", error);
      toast.error("Failed to publish content.");
    }
  };

  // Render content with draggable images
  const renderContent = () => {
    if (!quillRef.current) return "";
    const content = quillRef.current.root.innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = doc.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.src;
      const imageId = Object.keys(imageDataMap).find(
        (id) => imageDataMap[id] === src
      );
      if (imageId) {
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.innerHTML = `
          <div class="draggable-image" style="position: absolute; left: ${
            imagePositions[imageId]?.x || 0
          }px; top: ${imagePositions[imageId]?.y || 0}px;">
            <img src="${
              imageDataMap[imageId]
            }" style="width: ${imageSizes[imageId]?.width || 200}px; height: ${
          imageSizes[imageId]?.height || 200
        }px;" data-image-id="${imageId}" />
          </div>
        `;
        const draggableWrapper = document.createElement("div");
        const draggable = new Draggable({
          node: draggableWrapper,
          onStop: (e, data) => handleDragStop(imageId, e, data),
        });
        draggableWrapper.appendChild(wrapper.firstChild);
        img.replaceWith(draggableWrapper);
      }
    });

    return doc.body.innerHTML;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Publish New Content
      </h2>
      <div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Title
          </label>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter content title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Content
          </label>
          <div ref={editorRef} className="quill-editor"></div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Preview
          </label>
          <div
            className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-700"
            dangerouslySetInnerHTML={{ __html: renderContent() }}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit(onSubmit)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 shadow-md"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom styles
const styles = `
  .quill-editor .ql-container {
    min-height: 200px;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: #fff;
  }
  .quill-editor .ql-container.ql-dark {
    background: #1f2937;
    color: #e5e7eb;
    border-color: #4b5563;
  }
  .quill-editor .ql-toolbar {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem 0.5rem 0 0;
    background: #f9fafb;
  }
  .quill-editor .ql-toolbar.ql-dark {
    background: #374151;
    border-color: #4b5563;
  }
  .quill-editor .ql-toolbar .ql-picker-label {
    color: #374151;
  }
  .quill-editor .ql-toolbar.ql-dark .ql-picker-label {
    color: #e5e7eb;
  }
  .draggable-image {
    cursor: move;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Publish;