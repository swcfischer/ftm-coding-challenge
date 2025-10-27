import { useState } from "react";
import "./RecentMessages.css";
import { saveToKnowledgeBase } from "../services/api";

function RecentMessages({ messages, onSaveToKnowledgeBase }) {
  const [savingIds, setSavingIds] = useState(new Set());

  const handleSaveToKnowledgeBase = async (message) => {
    if (savingIds.has(message.id)) return;

    setSavingIds((prev) => new Set([...prev, message.id]));

    try {
      await saveToKnowledgeBase({
        question: message.question,
        answer: message.answer,
        tags: ["saved-from-chat"],
        isPinned: false,
      });
      onSaveToKnowledgeBase(message);
    } catch (error) {
      console.error("Failed to save to knowledge base:", error);
    } finally {
      setSavingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="recent-messages">
      <div className="recent-messages-header">
        <h2>💬 Recent Messages</h2>
        <span className="message-count">{messages.length} messages</span>
      </div>

      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Start a conversation with the AI assistant!</p>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${message.isError ? "error" : ""}`}
            >
              <div className="message-header">
                <span className="timestamp">
                  {formatTimestamp(message.timestamp)}
                </span>
                {!message.isError && (
                  <button
                    onClick={() => handleSaveToKnowledgeBase(message)}
                    disabled={savingIds.has(message.id)}
                    className="save-button"
                    title="Save to Knowledge Base"
                  >
                    {savingIds.has(message.id) ? "⏳" : "💾"}
                  </button>
                )}
              </div>

              <div className="question">
                <strong>Q:</strong> {message.question}
              </div>

              <div className="answer">
                <strong>A:</strong> {message.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentMessages;
