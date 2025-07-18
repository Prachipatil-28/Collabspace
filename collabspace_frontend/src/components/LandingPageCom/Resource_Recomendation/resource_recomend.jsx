import React, { useState } from "react";
import YouTubeResults from "./YouTubeResults";
import GitHubResults from "./GitHubResults";
import GoogleBooksResults from "./GoogleBooksResults";
import { FaSearch } from "react-icons/fa";

function Resource() {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const input = e.target.elements.query.value;
    setQuery(input);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-indigo-500">
          Resource Recommender
        </h1>
        <p className="text-gray-400 mt-2">
          Find relevant videos, code repositories, and books.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="max-w-md mx-auto mb-6 flex rounded-md shadow-md"
      >
        <input
          type="text"
          name="query"
          placeholder="Search for a topic like React"
          className="bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-l-md py-2 px-4 w-full"
        />
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
        >
          <FaSearch className="mr-2" /> Search
        </button>
      </form>

      {query && (
        <div className="space-y-6">
          <YouTubeResults query={query} />
          <GitHubResults query={query} />
          <GoogleBooksResults query={query} />
        </div>
      )}

      <footer className="mt-8 text-center text-gray-500">
        <p> Search the content that lets you inspire and create your own content...</p>
      </footer>
    </div>
  );
}

export default Resource;