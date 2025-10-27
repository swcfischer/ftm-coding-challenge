import { useState } from "react";
import "./AIAssistant.css";
import { sendMessage } from "../services/api";

function AIAssistant({ onNewMessage, loading, setLoading }) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(userMessage);
      onNewMessage(response);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show error message to user
      onNewMessage({
        id: Date.now(),
        question: userMessage,
        answer:
          "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <h2>🤖 AI Assistant</h2>
        <p>Ask me anything and I'll help you find the answer</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-assistant-form">
        <div className="input-group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            rows={3}
            disabled={loading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="send-button"
          >
            {loading ? "🔄 Thinking..." : "📤 Send"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
