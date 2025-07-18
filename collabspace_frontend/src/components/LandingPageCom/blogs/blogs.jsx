
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/api";
import { useTheme } from "../../../store/ThemeProvider.jsx";

const BlogList = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all content
  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/content/all");
      const fetchedContents = response.data;
      fetchedContents.forEach((content, index) => {
        if (!content.contentId) {
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
    fetchAllContent();
  }, []);

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">All Blogs</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading blogs...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No blogs found. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content, index) => (
            <div
              key={content.contentId || `content-${index}`}
              className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600 cursor-pointer"
              onClick={() => navigate(`/content/${content.contentId}`)}
            >
              <img
                src={getFirstImage(content.content)}
                alt={content.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{content.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{getExcerpt(content.content)}</p>
                <div className="mt-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Published: {formatDate(content.createdDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;