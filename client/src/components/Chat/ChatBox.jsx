import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FiSend, FiTrash2, FiMessageSquare, FiUser, FiClock } from "react-icons/fi";

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const ChatBox = ({ projectId, projectName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${projectId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/chat/${projectId}`, { message: newMessage });
      setMessages([...messages, res.data.chatMessage]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/chat/${messageId}`);
      setMessages(messages.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiMessageSquare /> Team Chat - {projectName}
          </h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FiMessageSquare className="text-xl" /> Team Chat
            </h3>
            <p className="text-blue-100 text-sm mt-1">{projectName}</p>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1 text-white text-sm">
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiMessageSquare className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-400">No messages yet</p>
            <p className="text-gray-300 text-sm">Be the first to say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_email === currentUser.email;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[70%] ${isOwnMessage
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl rounded-bl-2xl"
                      : "bg-white text-gray-800 rounded-t-2xl rounded-br-2xl shadow-sm border border-gray-100"
                    } p-3`}
                >
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-purple-600 text-xs" />
                      </div>
                      <p className="text-xs font-semibold text-purple-600">
                        {msg.user_name || msg.user_email.split('@')[0]}
                      </p>
                    </div>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <div className={`flex justify-between items-center mt-2 text-xs ${isOwnMessage ? "text-blue-200" : "text-gray-400"
                    }`}>
                    <div className="flex items-center gap-1">
                      <FiClock size={10} />
                      <span>{formatTime(msg.created_at)}</span>
                    </div>
                    {isOwnMessage && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="hover:text-red-300 transition ml-2"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-5 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;