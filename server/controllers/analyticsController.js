const mongoose = require("mongoose");

const Transaction = require("../models/Transaction");

const User = require("../models/User");

const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");

// ======================================================
// ADVANCED ANALYTICS
// ======================================================

exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();

    const currentMonth = now.getMonth() + 1;

    const currentYear = now.getFullYear();

    // ======================================================
    // CACHE CHECK
    // ======================================================

    const cachedAnalytics = await AnalyticsSnapshot.findOne({
      userId,
      month: currentMonth,
      year: currentYear,
    });

    if (cachedAnalytics) {
      console.log("Using Analytics Snapshot Cache");

      return res.status(200).json({
        success: true,
        analytics: cachedAnalytics,
        cached: true,
      });
    }

    console.log("Generating Fresh Analytics...");

    // ======================================================
    // USER
    // ======================================================

    const user = await User.findById(userId);

    const monthlyIncome = user?.monthlyIncome || 0;

    const monthlyBudget = user?.monthlyBudget || 0;

    // ======================================================
    // DATE RANGES
    // ======================================================

    const startOfCurrentMonth = new Date(currentYear, now.getMonth(), 1);

    const endOfCurrentMonth = new Date(
      currentYear,
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const startOfPreviousMonth = new Date(currentYear, now.getMonth() - 1, 1);

    const endOfPreviousMonth = new Date(
      currentYear,
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // ======================================================
    // ALL TRANSACTIONS
    // ======================================================

    const transactions = await Transaction.find({
      userId,
    });

    // ======================================================
    // TOTALS
    // ======================================================

    const totalExpense = transactions.reduce(
      (sum, txn) => sum + txn.amount,

      0
    );

    const totalTransactions = transactions.length;

    const totalSavings = monthlyIncome - totalExpense;

    // ======================================================
    // CATEGORY BREAKDOWN
    // ======================================================

    const categoryBreakdownRaw = await Transaction.aggregate([
      {
        $match: {
          userId,
        },
      },

      {
        $group: {
          _id: "$category",

          amount: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]);

    const categoryBreakdown = categoryBreakdownRaw.map((item) => ({
      category: item._id,

      amount: item.amount,

      percentage: Number(((item.amount / totalExpense) * 100).toFixed(1)),
    }));

    // ======================================================
    // MONTHLY COMPARISON
    // ======================================================

    const monthlyRaw = await Transaction.aggregate([
      {
        $match: {
          userId,
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$transactionDate",
            },
          },

          expense: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyComparison = monthlyRaw.map((item) => {
      const savings = monthlyIncome - item.expense;

      return {
        month: monthNames[item._id.month],

        income: monthlyIncome,

        expense: item.expense,

        savings,
      };
    });

    // ======================================================
    // MONTHLY EXPENSES
    // ======================================================

    const monthlyExpenses = monthlyComparison.map((item) => ({
      month: item.month,

      expense: item.expense,

      budget: monthlyBudget,
    }));

    // ======================================================
    // SAVINGS GROWTH
    // ======================================================

    let cumulativeSavings = 0;

    const savingsGrowth = monthlyComparison.map((item) => {
      cumulativeSavings += item.savings;

      return {
        month: item.month,

        amount: cumulativeSavings,
      };
    });

    // ======================================================
    // WEEKLY TREND
    // ======================================================

    const weeklyTrendRaw = await Transaction.aggregate([
      {
        $match: {
          userId,
        },
      },

      {
        $group: {
          _id: {
            week: {
              $week: "$transactionDate",
            },
          },

          amount: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          "_id.week": 1,
        },
      },
    ]);

    const weeklyTrend = weeklyTrendRaw.map((item) => ({
      week: `W${item._id.week}`,

      amount: item.amount,
    }));

    // ======================================================
    // CURRENT MONTH CATEGORY TOTALS
    // ======================================================

    const currentMonthBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: startOfCurrentMonth,

            $lte: endOfCurrentMonth,
          },
        },
      },

      {
        $group: {
          _id: "$category",

          amount: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // ======================================================
    // PREVIOUS MONTH CATEGORY TOTALS
    // ======================================================

    const previousMonthBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: startOfPreviousMonth,

            $lte: endOfPreviousMonth,
          },
        },
      },

      {
        $group: {
          _id: "$category",

          amount: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // ======================================================
    // MAP PREVIOUS
    // ======================================================

    const previousMap = {};

    previousMonthBreakdown.forEach((item) => {
      previousMap[item._id] = item.amount;
    });

    // ======================================================
    // CATEGORY BUDGETS
    // ======================================================

    const categoryBudgetMap = {
      "Food & Dining": monthlyBudget * 0.2,

      Shopping: monthlyBudget * 0.2,

      Travel: monthlyBudget * 0.15,

      Housing: monthlyBudget * 0.25,

      Health: monthlyBudget * 0.1,

      Education: monthlyBudget * 0.1,

      Transport: monthlyBudget * 0.05,

      "Bills & Utilities": monthlyBudget * 0.15,
    };

    // ======================================================
    // SPENDING BREAKDOWN
    // ======================================================

    const spendingBreakdown = currentMonthBreakdown.map((item) => ({
      category: item._id,

      current: item.amount,

      previous: previousMap[item._id] || 0,

      budget: Math.round(categoryBudgetMap[item._id] || 5000),
    }));

    // ======================================================
    // BUDGET UTILIZATION
    // ======================================================

    const categoryColors = {
      "Food & Dining": "#4F46E5",

      Shopping: "#10B981",

      Travel: "#F97316",

      Housing: "#EC4899",

      Health: "#8B5CF6",

      Education: "#14B8A6",

      Transport: "#06B6D4",

      "Bills & Utilities": "#F59E0B",
    };

    const budgetUtilization = spendingBreakdown.map((item) => ({
      name: item.category,

      value: Math.min(
        Math.round((item.current / item.budget) * 100),

        100
      ),

      fill: categoryColors[item.category] || "#8884d8",
    }));

    // ======================================================
    // SPENDING PATTERN
    // ======================================================

    const spendingPattern = spendingBreakdown.map((item) => ({
      subject: item.category,

      A: Math.min(
        Math.round((item.current / item.budget) * 100),

        100
      ),

      B: Math.min(
        Math.round((item.previous / item.budget) * 100),

        100
      ),

      fullMark: 100,
    }));

    // ======================================================
    // PREDICTED MONTHLY SPENDING
    // ======================================================

    const currentMonthExpense = currentMonthBreakdown.reduce(
      (sum, item) => sum + item.amount,

      0
    );

    const daysPassed = now.getDate();

    const totalDays = new Date(
      currentYear,

      currentMonth,

      0
    ).getDate();

    const predictedExpense = Math.round(
      (currentMonthExpense / daysPassed) * totalDays
    );

    const previousMonthExpense = previousMonthBreakdown.reduce(
      (sum, item) => sum + item.amount,

      0
    );

    const predictionChange =
      previousMonthExpense > 0
        ? (
            ((predictedExpense - previousMonthExpense) / previousMonthExpense) *
            100
          ).toFixed(1)
        : 0;

    // ======================================================
    // AI SCORE
    // ======================================================

    let aiScore = 100;

    if (predictedExpense > monthlyBudget) {
      aiScore -= 20;
    }

    if (totalSavings < 0) {
      aiScore -= 25;
    }

    const shoppingCategory = categoryBreakdown.find(
      (item) => item.category === "Shopping"
    );

    if (shoppingCategory && shoppingCategory.percentage > 25) {
      aiScore -= 10;
    }

    if (categoryBreakdown.length > 6) {
      aiScore -= 5;
    }

    aiScore = Math.max(aiScore, 0);

    // ======================================================
    // BUDGET HEALTH SCORE
    // ======================================================

    let budgetHealthScore = 100;

    const budgetUsage = (currentMonthExpense / monthlyBudget) * 100;

    if (budgetUsage > 90) {
      budgetHealthScore -= 40;
    } else if (budgetUsage > 75) {
      budgetHealthScore -= 20;
    }

    // ======================================================
    // AI PREDICTIONS
    // ======================================================

    const aiPredictions = [
      {
        title: "Predicted Monthly Spending",

        value: `₹${predictedExpense.toLocaleString()}`,

        change: `${predictionChange > 0 ? "+" : ""}${predictionChange}%`,

        trend: predictionChange > 0 ? "up" : "down",

        description: "Based on current spending patterns",
      },

      {
        title: "Estimated Savings",

        value: `₹${(monthlyIncome - predictedExpense).toLocaleString()}`,

        change: totalSavings >= 0 ? "Good" : "Negative",

        trend: totalSavings >= 0 ? "up" : "down",

        description: "If current trends continue",
      },

      {
        title: "Budget Health Score",

        value: `${budgetHealthScore}/100`,

        change: budgetHealthScore >= 70 ? "Good" : "Needs Attention",

        trend: budgetHealthScore >= 70 ? "up" : "down",

        description: "Overall financial health indicator",
      },
    ];

    // ======================================================
    // SMART RECOMMENDATIONS
    // ======================================================

    const smartRecommendations = [];

    // FOOD

    const foodCategory = spendingBreakdown.find(
      (item) => item.category === "Food & Dining"
    );

    if (foodCategory && foodCategory.current > foodCategory.budget) {
      smartRecommendations.push({
        title: "Reduce Dining Out",

        description:
          "Cooking at home 3 more days/week could save significant money monthly",

        savings: `₹${Math.round(
          foodCategory.current * 0.2
        ).toLocaleString()}/mo`,

        difficulty: "Easy",
      });
    }

    // SHOPPING

    const shoppingCategoryData = spendingBreakdown.find(
      (item) => item.category === "Shopping"
    );

    if (
      shoppingCategoryData &&
      shoppingCategoryData.current > shoppingCategoryData.budget
    ) {
      smartRecommendations.push({
        title: "Control Impulse Shopping",

        description:
          "Reducing unnecessary online purchases can improve monthly savings",

        savings: `₹${Math.round(
          shoppingCategoryData.current * 0.15
        ).toLocaleString()}/mo`,

        difficulty: "Medium",
      });
    }

    // TRAVEL

    const travelCategory = spendingBreakdown.find(
      (item) => item.category === "Travel"
    );

    if (travelCategory && travelCategory.current > travelCategory.budget) {
      smartRecommendations.push({
        title: "Optimize Travel Costs",

        description:
          "Advance booking and travel planning can reduce transportation expenses",

        savings: `₹${Math.round(
          travelCategory.current * 0.1
        ).toLocaleString()}/mo`,

        difficulty: "Medium",
      });
    }

    // NEGATIVE SAVINGS

    if (totalSavings < 0) {
      smartRecommendations.push({
        title: "Set Monthly Spending Limits",

        description: "You are currently overspending compared to your income",

        savings: `₹${Math.abs(totalSavings).toLocaleString()}/mo`,

        difficulty: "Hard",
      });
    }

    // NO RECOMMENDATIONS

    if (smartRecommendations.length === 0) {
      smartRecommendations.push({
        title: "Maintain Healthy Spending",

        description: "Your financial activity looks balanced and optimized",

        savings: "₹0/mo",

        difficulty: "Easy",
      });
    }

    // ======================================================
    // SAVE SNAPSHOT
    // ======================================================

    const analyticsSnapshot = await AnalyticsSnapshot.create({
      userId,
      month: currentMonth,
      year: currentYear,
      totalExpense,
      totalIncome: monthlyIncome,
      totalSavings,
      totalTransactions,
      aiScore,
      budgetHealthScore,
      categoryBreakdown,
      monthlyExpenses,
      savingsGrowth,
      weeklyTrend,
      aiPredictions,
      smartRecommendations,
      spendingBreakdown,
      budgetUtilization,
      monthlyComparison,
      spendingPattern,
    });

    // ======================================================
    // RESPONSE
    // ======================================================

    return res.status(200).json({
      success: true,
      analytics: analyticsSnapshot,
      cached: false,
    });
  } catch (err) {
    console.log("ADVANCED ANALYTICS ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch advanced analytics",
    });
  }
};
