const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
  "Message",
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
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    tokens_used: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    response_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Response time in milliseconds",
    },
    model_used: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "gpt-3.5-turbo",
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    indexes: [
      {
        fields: ["timestamp"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

module.exports = Message;
