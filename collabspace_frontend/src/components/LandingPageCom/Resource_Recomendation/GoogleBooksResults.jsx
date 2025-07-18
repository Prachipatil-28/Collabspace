import React, { useEffect, useState } from "react";
import { FaBookOpen } from "react-icons/fa";
import api from "../../../api/api";

const GoogleBooksResults = ({ query }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get("https://www.googleapis.com/books/v1/volumes", {
          params: {
            q: query,
            maxResults: 5,
            key: AIzaSyCrOsbKne0Psan_osrZeTdIACM5ZdfU1fk,
          },
        });
        setBooks(res.data.items);
      } catch (error) {
        console.error("Error fetching Google Books:", error);
        setBooks([]); // Set to empty array on error
      }
    };

    fetchBooks();
  }, [query]);

  return (
    <div className="resource-container books bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaBookOpen className="mr-2 text-blue-500" /> 📚 Google Books
      </h2>
      {books.length > 0 ? (
        <ul className="resource-list space-y-3">
          {books.map((book) => (
            <li key={book.id} className="hover:bg-gray-100 rounded-md p-2">
              <a
                href={book.volumeInfo.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                {book.volumeInfo.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No books found for this query.</p>
      )}
    </div>
  );
};

export default GoogleBooksResults;