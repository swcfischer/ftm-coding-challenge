import { useState, useEffect } from "react";
import "./App.css";
import AIAssistant from "./components/AIAssistant";
import RecentMessages from "./components/RecentMessages";
import KnowledgeBase from "./components/KnowledgeBase";
import { getMessages, getKnowledgeBase } from "./services/api";

function App() {
  const [messages, setMessages] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadMessages();
    loadKnowledgeBase();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const data = await getKnowledgeBase();
      setKnowledgeBase(data);
    } catch (error) {
      console.error("Failed to load knowledge base:", error);
    }
  };

  const handleNewMessage = (message) => {
    setMessages((prev) => [message, ...prev]);
  };

  const handleSaveToKnowledgeBase = async (message) => {
    // This will be handled by the KnowledgeBase component
    await loadKnowledgeBase();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Internal Team Dashboard</h1>
        <p>AI Assistant & Knowledge Base</p>
      </header>

      <div className="app-content">
        <div className="main-section">
          <AIAssistant
            onNewMessage={handleNewMessage}
            loading={loading}
            setLoading={setLoading}
          />
          <RecentMessages
            messages={messages}
            onSaveToKnowledgeBase={handleSaveToKnowledgeBase}
          />
        </div>

        <aside className="sidebar">
          <KnowledgeBase
            knowledgeBase={knowledgeBase}
            onUpdate={loadKnowledgeBase}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
