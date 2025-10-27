const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KnowledgeBase = sequelize.define(
  "KnowledgeBase",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000],
      },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 10000],
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Tags must be an array");
          }
        },
      },
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },
    isModerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    moderationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sourceMessageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "messages",
        key: "id",
      },
    },
    accessCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Number of times this item has been viewed or accessed",
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "knowledge_base",
    timestamps: true,
    indexes: [
      {
        fields: ["isPinned"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["isModerated"],
      },
      {
        fields: ["createdAt"],
      },
      {
        fields: ["lastAccessedAt"],
      },
    ],
  }
);

module.exports = KnowledgeBase;
