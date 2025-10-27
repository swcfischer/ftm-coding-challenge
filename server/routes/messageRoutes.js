const express = require("express");
const router = express.Router();
const { Message } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const aiAssistantService = require("../services/aiAssistantService");
const { aiMessageLimiter } = require("../middleware/rateLimiter");

// GET /api/messages/stats - Get message statistics
router.get("/stats", async (req, res) => {
  try {
    const totalMessages = await Message.count();
    const todayMessages = await Message.count({
      where: {
        timestamp: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const avgResponseTime = await Message.findAll({
      attributes: [
        [
          sequelize.fn("AVG", sequelize.col("response_time")),
          "averageResponseTime",
        ],
      ],
      where: {
        response_time: {
          [Op.not]: null,
        },
      },
    });

    res.json({
      totalMessages,
      todayMessages,
      averageResponseTime: Math.round(
        avgResponseTime[0]?.dataValues?.averageResponseTime || 0
      ),
    });
  } catch (error) {
    console.error("Error fetching message stats:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
});

// GET /api/messages - Get recent messages
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await Message.findAll({
      order: [["timestamp", "DESC"]],
      limit: Math.min(limit, 100), // Cap at 100
      offset,
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
      message: error.message,
    });
  }
});

// POST /api/messages - Send message to AI assistant
router.post("/", aiMessageLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Message is required and must be a non-empty string",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Message too long. Maximum 2000 characters allowed.",
      });
    }

    // Get recent conversation context (last 5 messages)
    const recentMessages = await Message.findAll({
      order: [["timestamp", "DESC"]],
      limit: 5,
    });

    // Send to AI assistant
    const aiResponse = await aiAssistantService.sendMessage(
      message,
      recentMessages.reverse() // Reverse to get chronological order
    );

    // Save to database
    const savedMessage = await Message.create({
      question: message.trim(),
      answer: aiResponse.response,
      timestamp: new Date(),
      tokens_used: aiResponse.tokensUsed,
      response_time: aiResponse.responseTime,
      model_used: aiResponse.model,
    });

    res.status(201).json({
      id: savedMessage.id,
      question: savedMessage.question,
      answer: savedMessage.answer,
      timestamp: savedMessage.timestamp,
      tokens_used: savedMessage.tokens_used,
      response_time: savedMessage.response_time,
      model_used: savedMessage.model_used,
    });
  } catch (error) {
    console.error("Error processing message:", error);

    // Handle specific error types
    if (error.message.includes("OpenAI")) {
      return res.status(503).json({
        error: "AI service temporarily unavailable",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to process message",
      message: "An internal error occurred. Please try again.",
    });
  }
});

// GET /api/messages/:id - Get specific message
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({
      error: "Failed to fetch message",
      message: error.message,
    });
  }
});

// DELETE /api/messages/:id - Delete message (for cleanup)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await message.destroy();
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      error: "Failed to delete message",
      message: error.message,
    });
  }
});

module.exports = router;
