import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { useUser } from "../contexts/UserContext";
import {
  initializeSocketConnection,
  joinConversation,
  leaveConversation,
  onNewMessage,
  sendTypingIndicator,
  onUserTyping,
  disconnectSocket,
  markMessagesAsRead,
  onMessageDelivered,
  onMessagesRead,
} from "../utils/socket";

interface Sender {
  _id: string;
  firstName?: string;
  lastName: string;
  email: string;
}

interface Message {
  _id: string;
  senderId?: Sender;
  content: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  deliveredAt?: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

interface Participant {
  _id: string;
  firstName?: string;
  lastName: string;
  email: string;
  role?: string;
  profilePicture?: string;
}

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Initialize socket connection when component mounts
  useEffect(() => {
    initializeSocketConnection();

    // Listen for new messages
    onNewMessage((data) => {
      console.log("New message received:", data);
      // Add message only if it doesn't already exist (prevents duplicates)
      //prevMessage is provided by react and contains and contains cur val of messages state
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === data._id);
        if (messageExists) return prevMessages;
        return [...prevMessages, data];
      });
    });

    // Listen for typing indicators
    onUserTyping((data) => {
      if (data.userId !== user?._id) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Listen for message delivered status
    onMessageDelivered(({ messageId, deliveredAt }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, deliveredAt } : msg
        )
      );
    });

    // Listen for messages read status
    onMessagesRead(({ messageIds, readAt }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, isRead: true, readAt } : msg
        )
      );
    });

    // Cleanup on unmount
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const lastMessageId = messages[messages.length - 1]._id;
      markMessagesAsRead({
        conversationId,
        messageId: lastMessageId,
      });
    }
  }, [messages, conversationId]);

  // Extract other participant from messages
  useEffect(() => {
    if (messages.length > 0 && user) {
      // Find the first message from someone who isn't the current user
      const otherUserMessage = messages.find(
        (msg) => msg.senderId && msg.senderId._id !== user._id
      );

      if (otherUserMessage && otherUserMessage.senderId) {
        setOtherParticipant({
          _id: otherUserMessage.senderId._id,
          firstName: otherUserMessage.senderId.firstName,
          lastName: otherUserMessage.senderId.lastName,
          email: otherUserMessage.senderId.email,
        });
      }
    }
  }, [messages, user]);

  const handleViewProfile = () => {
    if (!otherParticipant) return;

    // Navigate to the read-only profile view page
    navigate(`/view-profile/${otherParticipant._id}`);
  };

  const fetchMessages = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/chat/${conversationId}/messages?page=${page}&limit=50`
      );

      if (response.data.success) {
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load conversation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversationId) return;

    try {
      setSending(true);

      // Send via REST API - the backend will broadcast via WebSocket to all participants
      const response = await apiClient.post("/chat/messages", {
        conversationId: conversationId,
        content: newMessage,
        messageType: "text",
      });

      // Add the properly formatted message from API response to state
      if (response.data.success && response.data.message) {
        setMessages((prevMessages) => [...prevMessages, response.data.message]);
      }

      setNewMessage("");

      // Stop typing indicator
      if (conversationId) {
        sendTypingIndicator(conversationId, false);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (conversationId) {
      sendTypingIndicator(conversationId, true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(conversationId, false);
      }, 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/my-jobs"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to My Jobs
        </Link>
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            borderRadius: "4px",
            color: "#c33",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <Link
        to="/my-jobs"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#007bff",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        &larr; Back to My Jobs
      </Link>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        {/* Chat Header with Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "1px solid #ddd",
          }}
        >
          {otherParticipant ? (
            <div
              onClick={handleViewProfile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                {otherParticipant.firstName?.[0] ||
                  otherParticipant.lastName[0]}
              </div>
              <div>
                <div
                  style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}
                >
                  {otherParticipant.firstName || ""} {otherParticipant.lastName}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
              Chat
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#fee",
              border: "1px solid #f88",
              borderRadius: "4px",
              color: "#c33",
            }}
          >
            {error}
          </div>
        )}

        {/* Messages */}
        <div
          style={{
            minHeight: "400px",
            maxHeight: "500px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "16px",
            marginBottom: "16px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {/* Pagination info */}
          {pagination && pagination.total > 0 && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "12px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              Showing {messages.length} of {pagination.total} messages
              {pagination.hasMore && (
                <button
                  onClick={() => fetchMessages(pagination.page + 1)}
                  disabled={loading}
                  style={{
                    marginLeft: "8px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  Load More
                </button>
              )}
            </div>
          )}

          {messages.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId?._id === user?._id;
              const senderName = message.senderId?.lastName || "Unknown User";

              return (
                <div
                  key={message._id}
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: isOwnMessage ? "#007bff" : "#e9ecef",
                      color: isOwnMessage ? "white" : "#333",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        marginBottom: "4px",
                        opacity: 0.8,
                        fontWeight: "bold",
                      }}
                    >
                      {senderName}
                    </div>
                    <div style={{ marginBottom: "4px" }}>{message.content}</div>
                    <div
                      style={{
                        fontSize: "11px",
                        opacity: 0.7,
                        textAlign: "right",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "6px",
                      }}
                    >
                      <span>{formatDate(message.createdAt)}</span>
                      {isOwnMessage && (
                        <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                          {message.readAt
                            ? "✓✓"
                            : message.deliveredAt
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {otherUserTyping && otherParticipant && (
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                fontStyle: "italic",
                marginTop: "8px",
              }}
            >
              {otherParticipant.firstName || otherParticipant.lastName} is
              typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            disabled={sending}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            style={{
              padding: "12px 24px",
              backgroundColor:
                sending || !newMessage.trim() ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
