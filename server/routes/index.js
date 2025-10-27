const express = require("express");
const router = express.Router();

// Import route modules
const messageRoutes = require("./messageRoutes");
const knowledgeBaseRoutes = require("./knowledgeBaseRoutes");
const tagRoutes = require("./tagRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Team Dashboard API",
  });
});

// API routes
router.use("/messages", messageRoutes);
router.use("/knowledge-base", knowledgeBaseRoutes);
router.use("/tags", tagRoutes);

module.exports = router;
