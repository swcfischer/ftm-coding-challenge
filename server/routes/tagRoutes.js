const express = require("express");
const router = express.Router();
const knowledgeBaseService = require("../services/knowledgeBaseService");

// GET /api/tags - Get all available tags
router.get("/", async (req, res) => {
  try {
    const tags = await knowledgeBaseService.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      error: "Failed to fetch tags",
      message: error.message,
    });
  }
});

// GET /api/tags/categories - Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await knowledgeBaseService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: error.message,
    });
  }
});

module.exports = router;
