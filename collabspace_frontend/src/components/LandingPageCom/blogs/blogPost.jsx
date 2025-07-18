import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/api";
import { useTheme } from "../../../store/ThemeProvider.jsx";

const ViewContent = () => {
  const { contentId } = useParams();
  const { darkMode } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch content by ID
  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/content/${contentId}`);
      setContent(response.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Loading content...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        Content not found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {content.title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Published: {formatDate(content.createdDate)}
      </p>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: content.content,
        }}
      />
    </div>
  );
};

export default ViewContent;