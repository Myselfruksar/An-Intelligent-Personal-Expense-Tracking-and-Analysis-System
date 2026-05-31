const mongoose = require("mongoose");

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    // ======================================
    // INSIGHT TYPE
    // ======================================

    type: {
      type: String,

      enum: ["warning", "success", "recommendation", "info"],

      required: true,
    },

    // ======================================
    // TITLE
    // ======================================

    title: {
      type: String,

      default: "",
    },

    // ======================================
    // MESSAGE
    // ======================================

    message: {
      type: String,

      required: true,
    },

    // ======================================
    // ACTION BUTTON TEXT
    // ======================================

    actionText: {
      type: String,

      default: "",
    },

    // ======================================
    // CATEGORY
    // ======================================

    category: {
      type: String,

      default: "",
    },

    // ======================================
    // POTENTIAL SAVINGS
    // ======================================

    potentialSavings: {
      type: Number,

      default: 0,
    },

    // ======================================
    // CACHE EXPIRY
    // ======================================

    expiresAt: {
      type: Date,

      required: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIInsight",

  aiInsightSchema
);
