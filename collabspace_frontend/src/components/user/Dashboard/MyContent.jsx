import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import api from "../../../api/api";
import { useMyContext } from "../../../store/ContextApi.jsx";
import { useTheme } from "../../../store/ThemeProvider.jsx";

const MyContent = () => {
  const { currentUser } = useMyContext();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || { id: null };

  // Fetch all user content
  const fetchAll = async () => {
    if (!currentUser?.id && !user.id) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/content/user/${currentUser?.id || user.id}`);
      const fetchedContents = response.data;
      fetchedContents.forEach((content, index) => {
        if (!content.id) {
          console.warn(`Content at index ${index} is missing contentId`, content);
        }
      });
      setContents(fetchedContents);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [currentUser]);

  // Handle delete content
  const handleDelete = async () => {
    if (!contentToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/api/content/delete/${contentToDelete}`);
      toast.success("Content deleted successfully!");
      fetchAll();
      setShowDeleteModal(false);
      setContentToDelete(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content.");
    } finally {
      setLoading(false);
    }
  };

  // Extract first image from content
  const getFirstImage = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const img = doc.querySelector("img");
    return img ? img.src : "https://placehold.co/400x200?text=No+Image";
  };

  // Extract excerpt from content
  const getExcerpt = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const text = doc.body.textContent || "";
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">My Content</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading content...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No content found. Start creating in the Publish section!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content, index) => (
            <div
              key={content.id || `content-${index}`}
              className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600 cursor-pointer"
              onClick={() => navigate(`/content/${content.id}`)}
            >
              <img
                src={getFirstImage(content.body)}
                alt={content.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{content.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{getExcerpt(content.body)}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Published: {formatDate(content.createdDate)}
                  </span>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/edit-content/${content.contentId}`)}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      title="Edit Content"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setContentToDelete(content.contentId);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      title="Delete Content"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this content? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContent;