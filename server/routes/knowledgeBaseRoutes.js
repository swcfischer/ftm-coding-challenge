const express = require("express");
const router = express.Router();
const knowledgeBaseService = require("../services/knowledgeBaseService");
const { knowledgeBaseLimiter } = require("../middleware/rateLimiter");

// GET /api/knowledge-base/stats - Get knowledge base statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await knowledgeBaseService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching knowledge base stats:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
});

// GET /api/knowledge-base - Get knowledge base items with search/filter
router.get("/", async (req, res) => {
  try {
    const { search, tags, category, isPinned, limit, offset } = req.query;

    const options = {
      search,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      category,
      isPinned: isPinned !== undefined ? isPinned === "true" : undefined,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    };

    const items = await knowledgeBaseService.getItems(options);
    res.json(items);
  } catch (error) {
    console.error("Error fetching knowledge base items:", error);
    res.status(500).json({
      error: "Failed to fetch knowledge base items",
      message: error.message,
    });
  }
});

// POST /api/knowledge-base - Create new knowledge base item
router.post("/", knowledgeBaseLimiter, async (req, res) => {
  try {
    const { question, answer, tags, category, isPinned, sourceMessageId } =
      req.body;

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Question is required and must be a non-empty string",
      });
    }

    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return res.status(400).json({
        error: "Answer is required and must be a non-empty string",
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        error: "Question too long. Maximum 2000 characters allowed.",
      });
    }

    if (answer.length > 10000) {
      return res.status(400).json({
        error: "Answer too long. Maximum 10000 characters allowed.",
      });
    }

    const item = await knowledgeBaseService.createItem({
      question: question.trim(),
      answer: answer.trim(),
      tags: Array.isArray(tags) ? tags : [],
      category,
      isPinned: Boolean(isPinned),
      sourceMessageId: sourceMessageId ? parseInt(sourceMessageId) : null,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating knowledge base item:", error);
    res.status(500).json({
      error: "Failed to create knowledge base item",
      message: error.message,
    });
  }
});

// PUT /api/knowledge-base/:id - Update knowledge base item
router.put("/:id", knowledgeBaseLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input lengths if provided
    if (updateData.question && updateData.question.length > 2000) {
      return res.status(400).json({
        error: "Question too long. Maximum 2000 characters allowed.",
      });
    }

    if (updateData.answer && updateData.answer.length > 10000) {
      return res.status(400).json({
        error: "Answer too long. Maximum 10000 characters allowed.",
      });
    }

    const item = await knowledgeBaseService.updateItem(
      parseInt(id),
      updateData
    );
    res.json(item);
  } catch (error) {
    console.error("Error updating knowledge base item:", error);

    if (error.message === "Knowledge base item not found") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to update knowledge base item",
      message: error.message,
    });
  }
});

// DELETE /api/knowledge-base/:id - Delete knowledge base item
router.delete("/:id", knowledgeBaseLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await knowledgeBaseService.deleteItem(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error("Error deleting knowledge base item:", error);

    if (error.message === "Knowledge base item not found") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to delete knowledge base item",
      message: error.message,
    });
  }
});

// GET /api/knowledge-base/:id - Get specific knowledge base item
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const items = await knowledgeBaseService.getItems({
      limit: 1,
    });

    const item = items.find((item) => item.id === parseInt(id));

    if (!item) {
      return res.status(404).json({ error: "Knowledge base item not found" });
    }

    // Increment access count
    await knowledgeBaseService.incrementAccessCount(parseInt(id));

    res.json(item);
  } catch (error) {
    console.error("Error fetching knowledge base item:", error);
    res.status(500).json({
      error: "Failed to fetch knowledge base item",
      message: error.message,
    });
  }
});

module.exports = router;
