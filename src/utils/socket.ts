import { io, Socket } from "socket.io-client";

// Initialize socket connection
let socket: Socket | null = null;

export const initializeSocketConnection = () => {
  socket = io("http://localhost:3001", {
    withCredentials: true,
  });

  // Connection events
  socket.on("connect", () => {
    console.log("Connected to chat server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from chat server");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

// Join a conversation
export const joinConversation = (conversationId: string) => {
  if (!socket) return;
  socket.emit("join_conversation", conversationId);
};

// Leave a conversation
export const leaveConversation = (conversationId: string) => {
  if (!socket) return;
  socket.emit("leave_conversation", conversationId);
};

// Send a message (real-time)
export const sendMessageRealtime = (data: {
  conversationId: string;
  content: string;
  messageType?: string;
}) => {
  if (!socket) return;
  socket.emit("send_message", data);
};

// Listen for new messages
export const onNewMessage = (callback: (data: any) => void) => {
  if (!socket) return;
  socket.on("new_message", callback);
};

// Send typing indicator
export const sendTypingIndicator = (
  conversationId: string,
  isTyping: boolean
) => {
  if (!socket) return;
  socket.emit("typing", { conversationId, isTyping });
};

// Listen for typing
export const onUserTyping = (callback: (data: any) => void) => {
  if (!socket) return;
  socket.on("user_typing", callback);
};

// Mark messages as read
export const markMessagesAsRead = (conversationId: string) => {
  if (!socket) return;
  socket.emit("mark_as_read", conversationId);
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
