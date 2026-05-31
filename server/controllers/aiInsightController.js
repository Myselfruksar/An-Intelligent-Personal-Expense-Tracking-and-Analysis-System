const mongoose = require("mongoose");

const Transaction = require("../models/Transaction");

const AIInsight = require("../models/AIInsight");

// ==========================================
// GET AI INSIGHTS
// ==========================================

exports.getAIInsights = async (req, res) => {
  try {
    console.log("====================================");
    console.log("AI INSIGHT API HIT");
    console.log("====================================");

    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log("USER ID =>", userId);

    // ==========================================
    // CACHE CHECK
    // ==========================================

    const cachedInsights = await AIInsight.find({
      userId,

      expiresAt: {
        $gt: new Date(),
      },
    }).sort({ createdAt: -1 });

    console.log("cachedInsights =>", cachedInsights.length);

    if (cachedInsights.length > 0) {
      return res.status(200).json({
        success: true,

        insights: cachedInsights,

        cached: true,
      });
    }

    // ==========================================
    // DELETE OLD CACHE
    // ==========================================

    await AIInsight.deleteMany({
      userId,
    });

    // ==========================================
    // GET LATEST TRANSACTION
    // ==========================================

    const latestTransaction = await Transaction.findOne({
      userId,
    }).sort({ transactionDate: -1 });

    if (!latestTransaction) {
      return res.status(200).json({
        success: true,

        insights: [],

        cached: false,
      });
    }

    console.log("LATEST TRANSACTION =>", latestTransaction.transactionDate);

    // ==========================================
    // USE LATEST TRANSACTION DATE
    // ==========================================

    const latestDate = new Date(latestTransaction.transactionDate);

    const currentDay = latestDate.getUTCDay();

    // ==========================================
    // CURRENT WEEK
    // ==========================================

    const startOfWeek = new Date(
      Date.UTC(
        latestDate.getUTCFullYear(),

        latestDate.getUTCMonth(),

        latestDate.getUTCDate() - currentDay,

        0,
        0,
        0,
        0
      )
    );

    const endOfWeek = new Date(
      Date.UTC(
        startOfWeek.getUTCFullYear(),

        startOfWeek.getUTCMonth(),

        startOfWeek.getUTCDate() + 6,

        23,
        59,
        59,
        999
      )
    );

    // ==========================================
    // LAST WEEK
    // ==========================================

    const lastWeekStart = new Date(
      Date.UTC(
        startOfWeek.getUTCFullYear(),

        startOfWeek.getUTCMonth(),

        startOfWeek.getUTCDate() - 7,

        0,
        0,
        0,
        0
      )
    );

    const lastWeekEnd = new Date(
      Date.UTC(
        startOfWeek.getUTCFullYear(),

        startOfWeek.getUTCMonth(),

        startOfWeek.getUTCDate() - 1,

        23,
        59,
        59,
        999
      )
    );

    console.log("CURRENT WEEK START =>", startOfWeek);

    console.log("CURRENT WEEK END =>", endOfWeek);

    console.log("LAST WEEK START =>", lastWeekStart);

    console.log("LAST WEEK END =>", lastWeekEnd);

    // ==========================================
    // CURRENT WEEK DATA
    // ==========================================

    const currentWeekData = await Transaction.aggregate([
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
          _id: "$category",

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    console.log("CURRENT WEEK DATA =>", currentWeekData);

    // ==========================================
    // LAST WEEK DATA
    // ==========================================

    const lastWeekData = await Transaction.aggregate([
      {
        $match: {
          userId,

          transactionDate: {
            $gte: lastWeekStart,

            $lte: lastWeekEnd,
          },
        },
      },

      {
        $group: {
          _id: "$category",

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    console.log("LAST WEEK DATA =>", lastWeekData);

    // ==========================================
    // GENERATE INSIGHTS
    // ==========================================

    const generatedInsights = [];

    // ==========================================
    // CATEGORY COMPARISON INSIGHTS
    // ==========================================

    currentWeekData.forEach((current) => {
      const previous = lastWeekData.find((item) => item._id === current._id);

      const previousAmount = previous?.total || 0;

      // ======================================
      // NEW CATEGORY SPENDING
      // ======================================

      if (previousAmount === 0) {
        if (current.total >= 1000) {
          generatedInsights.push({
            userId,

            type: "warning",

            title: `${current._id} Spending Alert`,

            message: `You spent ₹${current.total.toLocaleString()} on ${
              current._id
            } this week`,

            actionText: `Track ${current._id.toLowerCase()} expenses`,

            category: current._id,

            potentialSavings: Math.round(current.total * 0.1),

            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
          });
        }

        return;
      }

      // ======================================
      // PERCENTAGE DIFFERENCE
      // ======================================

      const percentage =
        ((current.total - previousAmount) / previousAmount) * 100;

      // ======================================
      // HIGHER SPENDING
      // ======================================

      if (percentage > 10) {
        generatedInsights.push({
          userId,

          type: "warning",

          title: `${current._id} Increased`,

          message: `${current._id} spending increased by ${percentage.toFixed(
            0
          )}% compared to last week`,

          actionText: `Review ${current._id.toLowerCase()} expenses`,

          category: current._id,

          potentialSavings: Math.round(current.total * 0.15),

          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        });
      }

      // ======================================
      // LOWER SPENDING
      // ======================================
      else if (percentage < -10) {
        generatedInsights.push({
          userId,

          type: "success",

          title: `${current._id} Improved`,

          message: `${current._id} expenses reduced by ${Math.abs(
            percentage
          ).toFixed(0)}% this week`,

          actionText: "Keep it up!",

          category: current._id,

          potentialSavings: 0,

          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        });
      }
    });

    // ==========================================
    // TOTAL WEEKLY SPENDING
    // ==========================================

    const totalWeeklyExpense = currentWeekData.reduce(
      (sum, item) => sum + item.total,
      0
    );

    console.log("TOTAL WEEKLY EXPENSE =>", totalWeeklyExpense);

    // ==========================================
    // LAST WEEK TOTAL
    // ==========================================

    const lastWeekTotal = lastWeekData.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // ==========================================
    // OVERALL SPENDING TREND
    // ==========================================

    if (totalWeeklyExpense > lastWeekTotal && lastWeekTotal > 0) {
      const increasePercentage =
        ((totalWeeklyExpense - lastWeekTotal) / lastWeekTotal) * 100;

      generatedInsights.push({
        userId,

        type: "warning",

        title: "Weekly Spending Increased",

        message: `Your total spending increased by ${increasePercentage.toFixed(
          0
        )}% this week`,

        actionText: "Review your recent expenses",

        potentialSavings: Math.round(totalWeeklyExpense * 0.1),

        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      });
    }

    // ==========================================
    // SAVINGS RECOMMENDATION
    // ==========================================

    const highestCategory = [...lastWeekData].sort(
      (a, b) => b.total - a.total
    )[0];

    if (highestCategory) {
      const possibleSavings = Math.round(highestCategory.total * 0.2);

      generatedInsights.push({
        userId,

        type: "info",

        title: "Savings Opportunity",

        message: `You can save around ₹${possibleSavings.toLocaleString()} by reducing ${highestCategory._id.toLowerCase()} expenses`,

        actionText: "View suggestions",

        category: highestCategory._id,

        potentialSavings: possibleSavings,

        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      });
    }

    // ==========================================
    // BUDGET HEALTH
    // ==========================================

    if (totalWeeklyExpense < 5000) {
      generatedInsights.push({
        userId,

        type: "success",

        title: "Budget Health Good",

        message: "Your spending is under control this week",

        actionText: "Keep it up!",

        potentialSavings: 0,

        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      });
    }

    // ==========================================
    // LIMIT TO 3 INSIGHTS
    // ==========================================

    const finalInsights = generatedInsights.slice(0, 3);

    console.log("GENERATED INSIGHTS =>", finalInsights);


    // ==========================================
    // SAVE INSIGHTS
    // ==========================================

    if (finalInsights.length > 0) {
      await AIInsight.insertMany( finalInsights );
    }
  
    // ==========================================
    // FETCH SAVED INSIGHTS
    // ==========================================

    const latestInsights = await AIInsight.find({
      userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      insights: latestInsights,

      cached: false,
    });
  } catch (err) {
    console.log("AI INSIGHT ERROR =>", err);

    return res.status(500).json({
      success: false,

      message: "Failed to generate AI insights",
    });
  }
};
