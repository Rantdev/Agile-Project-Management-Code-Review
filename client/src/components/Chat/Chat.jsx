import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FiSend, FiUser, FiPaperclip, FiTrash2, FiSmile, FiImage } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const Chat = ({ projectId, projectName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${projectId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  };

  // Send message
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

  // Delete message
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

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-gray-50 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3">
        <h3 className="font-semibold">Team Chat - {projectName}</h3>
        <p className="text-xs opacity-90">{messages.length} messages</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FiUser className="text-4xl mx-auto mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_email === currentUser.email;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? "bg-blue-600 text-white rounded-l-xl rounded-br-xl"
                      : "bg-white text-gray-800 rounded-r-xl rounded-bl-xl shadow-sm"
                  } p-3`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 text-blue-600">
                      {msg.user_name}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <div className={`flex justify-between items-center mt-1 text-xs ${
                    isOwnMessage ? "text-blue-200" : "text-gray-400"
                  }`}>
                    <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                    {isOwnMessage && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="ml-2 hover:text-red-300 transition"
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
      <form onSubmit={sendMessage} className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;