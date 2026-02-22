import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";
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
} from "../../utils/socket";

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
  const [hiring, setHiring] = useState(false);
  const [isAlreadyHired, setIsAlreadyHired] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Initialize socket connection when component mounts
  useEffect(() => {
    initializeSocketConnection();

    // Listen for new messages
    onNewMessage((data) => {
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

  // Check if freelancer is already hired
  useEffect(() => {
    const checkContractStatus = async () => {
      if (!conversationId) return;

      try {
        const response = await apiClient.get(`/contract/${conversationId}`);
        if (response.data.success || response.data.contract) {
          // If a contract exists for this conversation, the freelancer is already hired
          setIsAlreadyHired(true);
          setContractId(response.data.contract._id);
        }
      } catch (err: any) {
        // 404 or other errors mean no contract exists, which is fine
        setIsAlreadyHired(false);
        setContractId(null);
      }
    };

    checkContractStatus();
  }, [conversationId]);

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
    if (!otherParticipant || !user) return;

    // Only clients can view freelancer profiles
    if (user.role !== "client") {
      setError("Only clients can view freelancer profiles");
      return;
    }

    // Navigate to the read-only profile view page
    navigate(`/view-profile/${otherParticipant._id}`);
  };

  const handleHire = async () => {
    if (!conversationId || !otherParticipant) return;

    try {
      setHiring(true);
      setError(null);

      const response = await apiClient.post(
        `/contract/proposal/${conversationId}/hire`
      );

      if (response.data.success) {
        // Show success message or navigate to contract page
        alert("Freelancer hired successfully!");
        // Optionally navigate to a contract or confirmation page
        // navigate(`/contracts/${response.data.contractId}`);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to hire freelancer"
      );
    } finally {
      setHiring(false);
    }
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
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="h-5 w-32 bg-[var(--color-muted)] rounded animate-pulse"></div>
          </div>

          {/* Chat card skeleton */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden">
            {/* Header skeleton */}
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-[var(--color-muted)] rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-[var(--color-muted)] rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-24 bg-[var(--color-muted)] rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Messages skeleton */}
            <div className="p-6 space-y-4 min-h-[400px]">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`h-16 rounded-2xl bg-[var(--color-muted)] animate-pulse ${
                      i % 2 === 0 ? "w-2/3" : "w-1/2"
                    }`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Input skeleton */}
            <div className="p-6 border-t border-[var(--color-border)]">
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-[var(--color-muted)] rounded-xl animate-pulse"></div>
                <div className="h-12 w-24 bg-[var(--color-muted)] rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate("/my-jobs")}
            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Jobs
          </button>

          {/* Error state */}
          <div className="p-8 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-error)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Failed to Load Conversation
            </h3>
            <p className="text-[var(--color-error)] mb-6">{error}</p>
            <button
              onClick={() => navigate("/my-jobs")}
              className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Back to My Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/my-jobs")}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to My Jobs
        </button>

        {/* Chat Card */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden shadow-sm">
          {/* Chat Header */}
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              {otherParticipant ? (
                <div
                  onClick={user?.role === "client" ? handleViewProfile : undefined}
                  className={`flex items-center gap-4 ${
                    user?.role === "client"
                      ? "cursor-pointer hover:opacity-80 transition-opacity"
                      : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {otherParticipant.firstName?.[0] ||
                      otherParticipant.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      {otherParticipant.firstName || ""}{" "}
                      {otherParticipant.lastName}
                    </h2>
                    {user?.role === "client" && (
                      <p className="text-sm text-[var(--color-text-tertiary)]">
                        Click to view profile
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Chat
                </h2>
              )}

              {user?.role === "client" &&
                otherParticipant &&
                (isAlreadyHired && contractId ? (
                  <button
                    onClick={() => navigate(`/contract/${contractId}`)}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    View Contract
                  </button>
                ) : (
                  <button
                    onClick={handleHire}
                    disabled={hiring}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hiring ? "Hiring..." : "Hire"}
                  </button>
                ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30">
              <div className="flex items-center gap-3 text-[var(--color-error)]">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-[var(--color-error)] hover:text-[var(--color-error)]/80"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="p-6">
            {/* Pagination info */}
            {pagination && pagination.total > 0 && (
              <div className="text-center mb-4">
                <span className="text-sm text-[var(--color-text-tertiary)]">
                  Showing {messages.length} of {pagination.total} messages
                </span>
                {pagination.hasMore && (
                  <button
                    onClick={() => fetchMessages(pagination.page + 1)}
                    disabled={loading}
                    className="ml-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="min-h-[400px] max-h-[500px] overflow-y-auto rounded-xl bg-[var(--color-muted)] p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-background)] flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-[var(--color-text-tertiary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-[var(--color-text-secondary)] font-medium">
                    No messages yet
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                    Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId?._id === user?._id;
                  const senderName = message.senderId?.lastName || "Unknown User";

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                          isOwnMessage
                            ? "bg-[var(--color-primary)] text-white rounded-br-md"
                            : "bg-[var(--color-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-bl-md"
                        }`}
                      >
                        <div
                          className={`text-xs font-semibold mb-1 ${
                            isOwnMessage
                              ? "text-white/80"
                              : "text-[var(--color-text-tertiary)]"
                          }`}
                        >
                          {senderName}
                        </div>
                        <div className="text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-2 text-xs ${
                            isOwnMessage
                              ? "text-white/70"
                              : "text-[var(--color-text-tertiary)]"
                          }`}
                        >
                          <span>{formatDate(message.createdAt)}</span>
                          {isOwnMessage && (
                            <span className="font-bold">
                              {message.readAt ? (
                                <svg
                                  className="w-4 h-4 text-white/90"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              ) : message.deliveredAt ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
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
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--color-card)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--color-text-tertiary)] italic">
                        {otherParticipant.firstName || otherParticipant.lastName}{" "}
                        is typing
                      </span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce"></span>
                        <span
                          className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-[var(--color-border)]">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
