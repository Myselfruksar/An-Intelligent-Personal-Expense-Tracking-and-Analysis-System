const mongoose = require("mongoose");

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    totalExpense: {
      type: Number,
      default: 0,
    },

    totalIncome: {
      type: Number,
      default: 0,
    },

    totalSavings: {
      type: Number,
      default: 0,
    },

    totalTransactions: {
      type: Number,
      default: 0,
    },

    aiScore: {
      type: Number,
      default: 0,
    },

    budgetHealthScore: {
      type: Number,
      default: 0,
    },

    categoryBreakdown: [
      {
        category: String,
        amount: Number,
        percentage: Number,
      },
    ],

    monthlyExpenses: [
      {
        month: String,
        expense: Number,
        budget: Number,
      },
    ],

    savingsGrowth: [
      {
        month: String,
        amount: Number,
      },
    ],

    weeklyTrend: [
      {
        week: String,
        amount: Number,
      },
    ],

    aiPredictions: [
      {
        title: String,
        value: String,
        change: String,
        trend: String,
        description: String,
      },
    ],

    smartRecommendations: [
      {
        title: String,
        description: String,
        savings: String,
        difficulty: String,
      },
    ],

    spendingBreakdown: [
      {
        category: String,
        current: Number,
        previous: Number,
        budget: Number,
      },
    ],

    budgetUtilization: [
      {
        name: String,
        value: Number,
        fill: String,
      },
    ],

    monthlyComparison: [
      {
        month: String,
        income: Number,
        expense: Number,
        savings: Number,
      },
    ],

    spendingPattern: [
      {
        subject: String,
        A: Number,
        B: Number,
        fullMark: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema);
