const express = require("express");

const router = express.Router();

const { auth } = require("../middleware/authMiddleware");

const {
  getDashboardAnalytics,
  getGraphAnalytics,
} = require("../controllers/dashboardController");

const { getAIInsights } = require("../controllers/aiInsightController");

const { getAdvancedAnalytics } = require("../controllers/analyticsController");

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================

router.get("/analytics", auth, getDashboardAnalytics);

// ==========================================
// GRAPH ANALYTICS
// ==========================================

router.get("/graph-analytics", auth, getGraphAnalytics);

// ==========================================
// AI INSIGHTS
// ==========================================

router.get("/ai-insights", auth, getAIInsights);

router.get("/advanced-analytics", auth, getAdvancedAnalytics);

module.exports = router;
