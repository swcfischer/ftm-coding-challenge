const sequelize = require("../config/database");
const Message = require("./Message");
const KnowledgeBase = require("./KnowledgeBase");

// Define associations here
Message.hasMany(KnowledgeBase, {
  foreignKey: "sourceMessageId",
  as: "knowledgeBaseItems",
});
KnowledgeBase.belongsTo(Message, {
  foreignKey: "sourceMessageId",
  as: "sourceMessage",
});

module.exports = {
  sequelize,
  Message,
  KnowledgeBase,
};
