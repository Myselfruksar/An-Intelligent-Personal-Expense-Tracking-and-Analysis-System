const mongoose = require("mongoose");

const Transaction = require("../models/Transaction");
const User = require("../models/User");

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();

    // ==========================================
    // CURRENT MONTH
    // ==========================================

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 2);

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // ==========================================
    // CURRENT WEEK (MONDAY TO SUNDAY)
    // ==========================================

    const currentDay = now.getDay();

    const distanceFromMonday = currentDay === 0 ? 6 : currentDay - 1;

    const startOfWeek = new Date(now);

    startOfWeek.setDate(now.getDate() - distanceFromMonday);

    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    endOfWeek.setHours(23, 59, 59, 999);

    console.log("startOfMonth", startOfMonth);
    console.log("endOfMonth", endOfMonth);

    console.log("startOfWeek", startOfWeek);
    console.log("endOfWeek", endOfWeek);

    // ==========================================
    // TOTAL EXPENSE
    // ==========================================

    const totalExpenseData = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },

      {
        $group: {
          _id: null,

          totalExpense: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalExpense = totalExpenseData[0]?.totalExpense || 0;

    // ==========================================
    // PREVIOUS MONTH EXPENSE
    // ==========================================

    const startOfPreviousMonth = new Date(
      now.getFullYear(),

      now.getMonth() - 1,

      1
    );

    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const previousMonthExpenseData = await Transaction.aggregate([
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
          _id: null,

          totalExpense: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const previousMonthExpense = previousMonthExpenseData[0]?.totalExpense || 0;

    // ==========================================
    // EXPENSE CHANGE
    // ==========================================

    let expenseChange = 0;

    if (previousMonthExpense > 0) {
      expenseChange = Number(
        (
          ((totalExpense - previousMonthExpense) / previousMonthExpense) *
          100
        ).toFixed(1)
      );
    }

    // ==========================================
    // MONTHLY OVERVIEW
    // ==========================================

    const monthlyOverview = await Transaction.aggregate([
      {
        $match: {
          userId,
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$transactionDate",
            },

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
          "_id.year": 1,
          "_id.month": 1,
        },
      },

      {
        $project: {
          _id: 0,

          month: {
            $arrayElemAt: [
              [
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
              ],

              "$_id.month",
            ],
          },

          expense: 1,
        },
      },
    ]);

    // ==========================================
    // WEEKLY TREND
    // ==========================================

    const weeklyTrend = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
        },
      },

      {
        $group: {
          _id: {
            $dayOfWeek: "$transactionDate",
          },

          amount: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },

      {
        $project: {
          _id: 0,

          day: {
            $arrayElemAt: [
              ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

              "$_id",
            ],
          },

          amount: 1,
        },
      },
    ]);

    // ==========================================
    // CATEGORY BREAKDOWN
    // ==========================================

    const categoryColors = {
      "Food & Dining": "#4F46E5",

      Transport: "#06B6D4",

      Shopping: "#10B981",

      "Bills & Utilities": "#F59E0B",

      Entertainment: "#EF4444",

      Health: "#8B5CF6",

      Education: "#14B8A6",

      Travel: "#F97316",

      Housing: "#EC4899",
    };

    const categoryBreakdownData = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },

      {
        $group: {
          _id: "$category",

          value: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          value: -1,
        },
      },
    ]);

    const categoryBreakdown = categoryBreakdownData.map((item) => ({
      name: item._id,

      value: item.value,

      color: categoryColors[item._id] || "#8884d8",
    }));

    // ==========================================
    // AI SCORE
    // ==========================================

    let aiScore = 100;

    // MANY EXPENSE CATEGORIES

    if (categoryBreakdown.length >= 5) {
      aiScore -= 10;
    }

    // SHOPPING HIGH

    const shoppingCategory = categoryBreakdown.find(
      (item) => item.name === "Shopping"
    );

    if (shoppingCategory?.value > 10000) {
      aiScore -= 20;
    }

    // FOOD HIGH

    const foodCategory = categoryBreakdown.find(
      (item) => item.name === "Food & Dining"
    );

    if (foodCategory?.value > 5000) {
      aiScore -= 10;
    }

    // HIGH MONTHLY EXPENSE

    if (totalExpense > 50000) {
      aiScore -= 20;
    }

    // SAFE LIMIT

    if (aiScore < 0) {
      aiScore = 0;
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      analytics: {
        totalExpense,

        expenseChange,

        aiScore,

        monthlyOverview,

        weeklyTrend,

        categoryBreakdown,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch dashboard analytics",
    });
  }
};

// ==========================================
// GRAPH ANALYTICS
// ==========================================

exports.getGraphAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const user = await User.findById(userId);

    const monthlyBudget = user?.monthlyBudget || 0;

    // ==========================================
    // LAST 12 MONTHS
    // ==========================================

    const now = new Date();

    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // ==========================================
    // MONTHLY EXPENSE DATA
    // ==========================================

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$transactionDate",
            },

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
          "_id.year": 1,

          "_id.month": 1,
        },
      },
    ]);

    // ==========================================
    // FORMAT MONTHLY DATA
    // ==========================================

    let cumulativeSavings = 0;

    const monthlyExpenseData = monthlyData.map((item) => {
      const expense = item.expense;

      const savings = monthlyBudget - expense;

      cumulativeSavings += savings;

      return {
        month: [
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
        ][item._id.month],

        expense,

        budget: monthlyBudget,

        savings,

        total: cumulativeSavings,
      };
    });

    // ==========================================
    // CATEGORY DISTRIBUTION
    // ==========================================

    const categoryColors = {
      "Food & Dining": "#4F46E5",

      Transport: "#06B6D4",

      Shopping: "#10B981",

      "Bills & Utilities": "#F59E0B",

      Entertainment: "#EF4444",

      Health: "#8B5CF6",

      Education: "#EC4899",

      Travel: "#14B8A6",

      Housing: "#F97316",
    };

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId,
        },
      },

      {
        $group: {
          _id: "$category",

          value: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          value: -1,
        },
      },
    ]);

    const formattedCategoryData = categoryData.map((item) => ({
      name: item._id,

      value: item.value,

      color: categoryColors[item._id] || "#8884d8",
    }));

    // ==========================================
    // WEEKLY CATEGORY TREND
    // ==========================================

    const trendRaw = await Transaction.aggregate([
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

            category: "$category",
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

    // ==========================================
    // FORMAT TREND DATA
    // ==========================================

    const trendMap = {};

    trendRaw.forEach((item) => {
      const week = `W${item._id.week}`;

      if (!trendMap[week]) {
        trendMap[week] = {
          week,

          food: 0,

          transport: 0,

          shopping: 0,

          bills: 0,
        };
      }

      const category = item._id.category;

      if (category === "Food & Dining") {
        trendMap[week].food = item.amount;
      }

      if (category === "Transport") {
        trendMap[week].transport = item.amount;
      }

      if (category === "Shopping") {
        trendMap[week].shopping = item.amount;
      }

      if (category === "Bills & Utilities") {
        trendMap[week].bills = item.amount;
      }
    });

    const trendData = Object.values(trendMap);

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      graphs: {
        monthlyExpenseData,

        categoryData: formattedCategoryData,

        trendData,

        savingsGrowthData: monthlyExpenseData,

        financialOverview: monthlyExpenseData,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch graph analytics",
    });
  }
};
