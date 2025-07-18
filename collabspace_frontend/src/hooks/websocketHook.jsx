// src/hooks/useWebSocket.js
import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const useWebSocket = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [toolContent, setToolContent] = useState("");

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      // Subscribe to session-specific tool updates
      stompClient.subscribe(`/topic/session/${sessionId}/tool-update`, (message) => {
        const update = JSON.parse(message.body);
        setToolContent(update.content);
      });

      // Subscribe to session-specific messages
      stompClient.subscribe(`/topic/session/${sessionId}/message`, (message) => {
        const msg = JSON.parse(message.body);
        setMessages((prev) => [...prev, msg]);
      });
    });

    return () => stompClient.disconnect();
  }, [sessionId]);

  const sendToolUpdate = (toolName, content) => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.send(
        `/app/session/${sessionId}/tool-update`,
        {},
        JSON.stringify({
          sessionId,
          toolName,
          content,
        })
      );
    });
  };

  const sendMessage = (sender, content) => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.send(
        `/app/session/${sessionId}/message`,
        {},
        JSON.stringify({
          sessionId,
          sender,
          content,
        })
      );
    });
  };

  return { messages, toolContent, sendToolUpdate, sendMessage };
};

export default useWebSocket;