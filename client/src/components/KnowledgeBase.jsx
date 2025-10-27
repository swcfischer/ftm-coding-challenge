import { useState, useEffect } from "react";
import "./KnowledgeBase.css";
import {
  getKnowledgeBase,
  updateKnowledgeBaseItem,
  deleteKnowledgeBaseItem,
  getTags,
} from "../services/api";

function KnowledgeBase({ knowledgeBase, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTags, setEditingTags] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    filterItems();
  }, [knowledgeBase, searchTerm, selectedTags]);

  const loadTags = async () => {
    try {
      const tags = await getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  const filterItems = () => {
    let filtered = [...knowledgeBase];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(term) ||
          item.answer.toLowerCase().includes(term)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTags.some((tag) => item.tags.includes(tag))
      );
    }

    // Sort: pinned first, then by creation date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredItems(filtered);
  };

  const handleTogglePin = async (item) => {
    try {
      await updateKnowledgeBaseItem(item.id, {
        ...item,
        isPinned: !item.isPinned,
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const handleUpdateTags = async (item) => {
    try {
      const newTags = editingTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      await updateKnowledgeBaseItem(item.id, {
        ...item,
        tags: newTags,
      });
      setEditingId(null);
      setEditingTags("");
      onUpdate();
    } catch (error) {
      console.error("Failed to update tags:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteKnowledgeBaseItem(id);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const startEditingTags = (item) => {
    setEditingId(item.id);
    setEditingTags(item.tags.join(", "));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="knowledge-base">
      <div className="knowledge-base-header">
        <h2>📚 Knowledge Base</h2>
        <span className="item-count">{filteredItems.length} items</span>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {availableTags.length > 0 && (
        <div className="tags-filter">
          <h4>Filter by tags:</h4>
          <div className="tags-list">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`tag-button ${
                  selectedTags.includes(tag) ? "active" : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="knowledge-items">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            {knowledgeBase.length === 0 ? (
              <p>No saved knowledge yet. Save some answers from the chat!</p>
            ) : (
              <p>No items match your search criteria.</p>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`knowledge-item ${item.isPinned ? "pinned" : ""}`}
            >
              <div className="item-header">
                <button
                  onClick={() => handleTogglePin(item)}
                  className="pin-button"
                  title={item.isPinned ? "Unpin" : "Pin"}
                >
                  {item.isPinned ? "📌" : "📍"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="delete-button"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              <div className="item-content">
                <div className="question">
                  <strong>Q:</strong> {item.question}
                </div>
                <div className="answer">
                  <strong>A:</strong> {item.answer}
                </div>
              </div>

              <div className="item-footer">
                <div className="tags-section">
                  {editingId === item.id ? (
                    <div className="tags-edit">
                      <input
                        type="text"
                        value={editingTags}
                        onChange={(e) => setEditingTags(e.target.value)}
                        placeholder="Enter tags separated by commas"
                        className="tags-input"
                      />
                      <div className="tags-edit-buttons">
                        <button onClick={() => handleUpdateTags(item)}>
                          ✓
                        </button>
                        <button onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div className="tags-display">
                      {item.tags.length > 0 ? (
                        item.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="no-tags">No tags</span>
                      )}
                      <button
                        onClick={() => startEditingTags(item)}
                        className="edit-tags-button"
                        title="Edit tags"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>
                <div className="created-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default KnowledgeBase;
