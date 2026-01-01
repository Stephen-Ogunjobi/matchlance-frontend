import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../utils/api";
import { useUser } from "../contexts/UserContext";

interface Sender {
  _id: string;
  firstName?: string;
  lastName: string;
  email: string;
}

interface Message {
  _id: string;
  senderId: Sender;
  content: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
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

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

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

    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await apiClient.post("/chat/messages", {
        conversationId: conversationId,
        content: newMessage,
        messageType: "text",
      });

      setNewMessage("");
      // Refresh messages to get the new message
      await fetchMessages();
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
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
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Chat</h1>

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
              const isOwnMessage = message.senderId._id === user?._id;
              const senderName = message.senderId.firstName
                ? `${message.senderId.firstName} ${message.senderId.lastName}`
                : message.senderId.lastName;

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
                      }}
                    >
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
