
import React from "react";
import { Link } from "react-router-dom";

const SessionList = ({ sessions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <Link
          key={session.sessionId}
          to={`/workspace/session/${session.sessionId}`}
          className={`block p-4 rounded-lg shadow-md ${
            session.type === "private"
              ? "border-red-200 bg-red-50"
              : session.type === "public"
              ? "border-blue-200 bg-blue-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-800">{session.name}</h3>
          <p className="text-sm text-gray-600">
            Type: {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
          </p>
          <p className="text-sm text-gray-600">
            Participants: {session.participantsId?.join(", ") || "None"}
          </p>
          <p className="text-sm text-gray-600">
            Duration: {session.startDate} - {session.endDate}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default SessionList;