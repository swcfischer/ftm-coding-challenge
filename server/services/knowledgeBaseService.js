const { KnowledgeBase } = require("../models");
const { Op } = require("sequelize");
const aiAssistantService = require("./aiAssistantService");

class KnowledgeBaseService {
  async getItems(options = {}) {
    const { search, tags, category, isPinned, limit, offset } = options;

    const whereClause = {};

    // Search in question and answer
    if (search) {
      whereClause[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      whereClause.tags = {
        [Op.overlap]: tags,
      };
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by pinned status
    if (isPinned !== undefined) {
      whereClause.isPinned = isPinned;
    }

    const items = await KnowledgeBase.findAll({
      where: whereClause,
      order: [
        ["isPinned", "DESC"], // Pinned items first
        ["createdAt", "DESC"], // Then by newest
      ],
      limit: limit || 50,
      offset: offset || 0,
    });

    return items;
  }

  async createItem(data) {
    const {
      question,
      answer,
      tags = [],
      category,
      isPinned = false,
      sourceMessageId,
    } = data;

    // Basic content moderation
    const moderationResult = await this.moderateContent(question, answer);

    const item = await KnowledgeBase.create({
      question,
      answer,
      tags: Array.isArray(tags) ? tags : [],
      category,
      isPinned,
      sourceMessageId,
      isModerated: moderationResult.isApproved,
      moderationNotes: moderationResult.notes,
    });

    return item;
  }

  async updateItem(id, data) {
    const item = await KnowledgeBase.findByPk(id);
    if (!item) {
      throw new Error("Knowledge base item not found");
    }

    // If question or answer is being updated, re-moderate
    let moderationResult = {
      isApproved: item.isModerated,
      notes: item.moderationNotes,
    };
    if (data.question !== undefined || data.answer !== undefined) {
      const question =
        data.question !== undefined ? data.question : item.question;
      const answer = data.answer !== undefined ? data.answer : item.answer;
      moderationResult = await this.moderateContent(question, answer);
    }

    const updateData = {
      ...data,
      isModerated: moderationResult.isApproved,
      moderationNotes: moderationResult.notes,
    };

    await item.update(updateData);
    return item;
  }

  async deleteItem(id) {
    const item = await KnowledgeBase.findByPk(id);
    if (!item) {
      throw new Error("Knowledge base item not found");
    }

    await item.destroy();
    return { message: "Item deleted successfully" };
  }

  async incrementAccessCount(id) {
    const item = await KnowledgeBase.findByPk(id);
    if (item) {
      await item.update({
        accessCount: item.accessCount + 1,
        lastAccessedAt: new Date(),
      });
    }
  }

  async getAllTags() {
    const items = await KnowledgeBase.findAll({
      attributes: ["tags"],
      where: {
        tags: {
          [Op.not]: [],
        },
      },
    });

    // Extract and flatten all tags
    const allTags = items.reduce((acc, item) => {
      return acc.concat(item.tags || []);
    }, []);

    // Get unique tags and sort them
    const uniqueTags = [...new Set(allTags)].sort();

    return uniqueTags;
  }

  async getCategories() {
    const categories = await KnowledgeBase.findAll({
      attributes: ["category"],
      where: {
        category: {
          [Op.not]: null,
        },
      },
      group: ["category"],
    });

    return categories
      .map((item) => item.category)
      .filter(Boolean)
      .sort();
  }

  async moderateContent(question, answer) {
    try {
      const content = `${question}\n\n${answer}`;

      // Use OpenAI moderation if available
      if (process.env.CONTENT_MODERATION_ENABLED === "true") {
        const moderation = await aiAssistantService.moderateContent(content);

        if (moderation.flagged) {
          const flaggedCategories = Object.keys(
            moderation.categories || {}
          ).filter((key) => moderation.categories[key]);

          return {
            isApproved: false,
            notes: `Content flagged for: ${flaggedCategories.join(", ")}`,
          };
        }
      }

      // Basic keyword filtering
      const inappropriateWords = ["spam", "inappropriate"]; // Add more as needed
      const contentLower = content.toLowerCase();

      for (const word of inappropriateWords) {
        if (contentLower.includes(word)) {
          return {
            isApproved: false,
            notes: `Content contains inappropriate keyword: ${word}`,
          };
        }
      }

      return {
        isApproved: true,
        notes: null,
      };
    } catch (error) {
      console.error("Content moderation error:", error);
      // Default to approved if moderation fails
      return {
        isApproved: true,
        notes: "Moderation service unavailable",
      };
    }
  }

  async getStats() {
    const totalItems = await KnowledgeBase.count();
    const pinnedItems = await KnowledgeBase.count({
      where: { isPinned: true },
    });
    const moderatedItems = await KnowledgeBase.count({
      where: { isModerated: false },
    });

    return {
      totalItems,
      pinnedItems,
      pendingModeration: moderatedItems,
    };
  }
}

module.exports = new KnowledgeBaseService();
