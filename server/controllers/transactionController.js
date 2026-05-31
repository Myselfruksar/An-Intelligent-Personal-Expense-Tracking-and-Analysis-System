const Transaction = require("../models/Transaction");

const {
  VALID_CATEGORIES,
  VALID_PAYMENT_METHODS,
} = require("../utils/categoryValidation");

const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");
const AIInsight = require("../models/AIInsight");

// ADD EXPENSE
exports.addExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      amount,
      description,
      category,
      transactionDate,
      paymentMethod,
      notes,
    } = req.body;

    // VALIDATION

    if (
      !amount ||
      !description ||
      !category ||
      !transactionDate ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const newTransaction = await Transaction.create({
      userId,
      amount,
      description,
      category,
      transactionDate,
      paymentMethod,
      notes,
      status: "completed",
    });

    await AnalyticsSnapshot.deleteMany({
      userId,
    });
    await AIInsight.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: newTransaction,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to add expense",
    });
  }
};

// GET RECENT TRANSACTIONS
exports.getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};

// GET ALL TRANSACTIONS + REPORT STATS

exports.getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const { startDate, endDate } = req.query;

    let filter = {
      userId,
    };

    // DATE FILTER
    if (startDate && endDate) {
      filter.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // FETCH TRANSACTIONS
    const transactions = await Transaction.find(filter).sort({
      transactionDate: -1,
    });

    // =========================
    // TRANSACTION COUNT
    // =========================

    const transactionCount = transactions.length;

    // =========================
    // TOTAL EXPENSE
    // =========================

    const totalExpense = transactions.reduce(
      (acc, item) => acc + item.amount,

      0
    );

    // =========================
    // AVERAGE DAILY SPENDING
    // =========================

    let averageDailySpending = 0;

    if (startDate && endDate) {
      const days =
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      averageDailySpending = totalExpense / days;
    }

    // =========================
    // HIGHEST SPENDING CATEGORY
    // =========================

    const categoryTotals = {};

    transactions.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }

      categoryTotals[transaction.category] += transaction.amount;
    });

    let highestSpendingCategory = null;

    if (Object.keys(categoryTotals).length > 0) {
      const highestCategory = Object.entries(categoryTotals).sort(
        (a, b) => b[1] - a[1]
      )[0];

      highestSpendingCategory = {
        category: highestCategory[0],

        amount: highestCategory[1],
      };
    }

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,

      data: transactions,

      reportStats: {
        transactionCount,

        averageDailySpending: Number(averageDailySpending.toFixed(2)),

        highestSpendingCategory,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch transactions",
    });
  }
};

// DELETE EXPENSE
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await Transaction.findByIdAndDelete(transactionId);

    
    await AnalyticsSnapshot.deleteMany({
      userId,
    });
    await AIInsight.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete expense",
    });
  }
};

// UPDATE EXPENSE
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const { transactionId } = req.params;

    const {
      amount,
      description,
      category,
      transactionDate,
      paymentMethod,
      notes,
      status,
    } = req.body;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        amount,
        description,
        category,
        transactionDate,
        paymentMethod,
        notes,
        status,
      },

      {
        new: true,
        runValidators: true,
      }
    );

    
    await AnalyticsSnapshot.deleteMany({
      userId,
    });
    await AIInsight.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};
