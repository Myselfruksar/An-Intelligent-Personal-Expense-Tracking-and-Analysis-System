// DashboardPage.tsx - latest updated code

import { motion } from "framer-motion";

import {
  Wallet,
  Target,
  PiggyBank,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ShoppingCart,
  Car,
  Utensils,
  AlertCircle,
  TrendingDown,
  Lightbulb,
  Pencil,
  Trash2,
  Eye,

} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import { toast } from "sonner";

import { cn } from "../lib/utils";

import {
  dashboardEndpoints,
  transactionEndpoints,
} from "@/services/api";

const fadeIn = {
  initial: { opacity: 0, y: 20 },

  animate: { opacity: 1, y: 0 },

  transition: { duration: 0.4 },
};

const CACHE_TIME = 1000 * 60 * 5;

const getCachedData = (key: string) => {
  const cached = sessionStorage.getItem(key);

  if (!cached) return null;
  const parsed = JSON.parse(cached);
  const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;

  if (isExpired) {
    sessionStorage.removeItem(key);
    return null;
  }

  return parsed.data;
};

const setCachedData = (key: string, data: any) => {
  sessionStorage.setItem(
    key,JSON.stringify({data,timestamp: Date.now(),})
  );
};



export default function DashboardPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState<any>(null);

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // =====================================
      // CHECK CACHE FIRST
      // =====================================

      const cachedAnalytics = getCachedData("dashboard_analytics");

      const cachedInsights = getCachedData("dashboard_ai_insights");

      const cachedTransactions = getCachedData("dashboard_recent_transactions");

      // =====================================
      // USE CACHE IF AVAILABLE
      // =====================================

      if (cachedAnalytics && cachedInsights && cachedTransactions) {
        setDashboardData(cachedAnalytics);

        setAiInsights(cachedInsights);

        setRecentTransactions(cachedTransactions);

        setLoading(false);

        return;
      }

      // =====================================
      // FETCH APIs
      // =====================================

      const [analyticsResponse, aiResponse, recentResponse] = await Promise.all(
        [
          axios.get(
            dashboardEndpoints.DASHBOARD_ANALYTICS,

            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            dashboardEndpoints.AI_INSIGHTS,

            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            transactionEndpoints.RECENT_TRANSACTIONS,

            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]
      );

      // =====================================
      // SET STATE
      // =====================================

      setDashboardData(analyticsResponse.data.analytics);

      setAiInsights(aiResponse.data.insights || []);

      setRecentTransactions(recentResponse.data.data || []);

      // =====================================
      // CACHE DATA
      // =====================================

      setCachedData(
        "dashboard_analytics",

        analyticsResponse.data.analytics
      );

      setCachedData(
        "dashboard_ai_insights",

        aiResponse.data.insights || []
      );
      const transactions = recentResponse.data.data || [];
      setCachedData(
        "dashboard_recent_transactions",transactions
      );
      
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================
  // DYNAMIC STATS
  // =========================

  const totalExpense = dashboardData?.totalExpense || 0;

  const monthlyBudget = user?.monthlyBudget || 0;

  const savings = (user?.monthlyIncome || 0) - totalExpense;

  const budgetUsed =
    monthlyBudget > 0 ? ((totalExpense / monthlyBudget) * 100).toFixed(1) : 0;

  const statCards = [
    {
      title: "Total Expense",

      value: `₹${totalExpense.toLocaleString()}`,

      change: `${dashboardData?.expenseChange || 0}%`,

      trend: dashboardData?.expenseChange >= 0 ? "up" : "down",

      icon: Wallet,

      color: "primary",
    },

    {
      title: "Monthly Budget",

      value: `₹${monthlyBudget.toLocaleString()}`,

      change: `${budgetUsed}% used`,

      trend: "neutral",

      icon: Target,

      color: "secondary",
    },

    {
      title: "Savings",

      value: `₹${savings.toLocaleString()}`,

      change: savings >= 0 ? "Good" : "Overspending",

      trend: savings >= 0 ? "up" : "down",

      icon: PiggyBank,

      color: "success",
    },

    {
      title: "AI Score",

      value: `${dashboardData?.aiScore || 0}/100`,

      change: dashboardData?.aiScore >= 70 ? "Excellent" : "Needs Improvement",

      trend: dashboardData?.aiScore >= 70 ? "up" : "down",

      icon: Sparkles,

      color: "primary",
    },
  ];

  // =========================
  // CATEGORY ICON
  // =========================

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "food & dining":
        return Utensils;

      case "transport":
        return Car;

      case "shopping":
        return ShoppingCart;

      default:
        return CreditCard;
    }
  };

  // =========================
  // DELETE TRANSACTION
  // =========================

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const response = await axios.delete(
        `${transactionEndpoints.DELETE_EXPENSE}/${transactionId}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        toast.error(response.data.message);

        return;
      }

      toast.success("Transaction deleted");

      // =====================================
      // CLEAR CACHE
      // =====================================

      sessionStorage.removeItem("dashboard_analytics");

      sessionStorage.removeItem("dashboard_ai_insights");

      sessionStorage.removeItem("dashboard_recent_transactions");
      
      sessionStorage.removeItem("advanced_analytics_cache");

      // =====================================
      // UPDATE UI
      // =====================================

      setRecentTransactions((prev) =>
        prev.filter((item) => item._id !== transactionId)
      );

      // REFRESH DATA

      fetchDashboardData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const monthlyOverviewData =
    dashboardData?.monthlyOverview?.map((item: any) => ({
      ...item,
      budget: user?.monthlyBudget || 0,
    })) || [];
  const hasEnoughTransactions =  recentTransactions.length >= 5;

  if (!hasEnoughTransactions) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-3">
          Start Adding Transactions 📊
        </h2>

        <p className="text-muted-foreground mb-4">
          Add at least 5–10 transactions to unlock dashboard analytics and
          AI-powered financial insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl p-5 hover:shadow-glow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  stat.color === "primary" && "gradient-primary",
                  stat.color === "secondary" && "bg-secondary/20",
                  stat.color === "success" && "bg-success/20"
                )}
              >
                <stat.icon
                  className={cn(
                    "w-5 h-5",
                    stat.color === "primary" && "text-white",
                    stat.color === "secondary" && "text-secondary",
                    stat.color === "success" && "text-success"
                  )}
                />
              </div>

              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  stat.trend === "up" && "text-success bg-success/10",
                  stat.trend === "down" && "text-destructive bg-destructive/10",
                  stat.trend === "neutral" && "text-muted-foreground bg-muted"
                )}
              >
                {stat.trend === "up" && <ArrowUpRight className="w-3 h-3" />}

                {stat.trend === "down" && (
                  <ArrowDownRight className="w-3 h-3" />
                )}

                {stat.change}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>

            <p
              className={cn(
                "font-numbers text-2xl font-bold",
                stat.color === "primary" && "text-primary",
                stat.color === "secondary" && "text-secondary",
                stat.color === "success" && "text-success"
              )}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Overview */}

        <motion.div
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-semibold">Monthly Overview</h3>

              <p className="text-sm text-muted-foreground">Expense vs Budget</p>
            </div>
          </div>

          <div className="h-90 mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOverviewData} barGap={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(148, 163, 184, 0.1)"
                  }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />

                <Bar
                  dataKey="budget"
                  fill="rgba(0, 196, 204, 0.99)"
                  radius={[6, 6, 0, 0]}
                  name="Budget"
                />

                <Bar
                  dataKey="expense"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}

        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-2">
            Category Breakdown
          </h3>

          <p className="text-sm text-muted-foreground mb-4">This month</p>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.categoryBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(dashboardData?.categoryBreakdown || []).map(
                    (entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                  )}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {(dashboardData?.categoryBreakdown || []).map((cat: any) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: cat.color,
                    }}
                  />

                  <span>{cat.name}</span>
                </div>

                <span className="font-numbers font-medium">
                  ₹{cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row */}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Weekly Trend */}

        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-2">Weekly Trend</h3>

          <p className="text-sm text-muted-foreground mb-4">
            Daily spending pattern
          </p>

          <div className="h-50">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dashboardData?.weeklyTrend || []}
                margin={{
                  top: 5,
                  right: 15,
                  left: 15,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "Spent",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights */}

        <motion.div
          {...fadeIn}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            <div>
              <h3 className="font-heading font-semibold">AI Insights</h3>

              <p className="text-xs text-muted-foreground">
                Smart spending suggestions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight: any, index: number) => {
              const Icon =
                insight.type === "warning"
                  ? AlertCircle
                  : insight.type === "success"
                  ? Lightbulb
                  : TrendingDown;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.6 + index * 0.1,
                  }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl",
                    insight.type === "warning" && "bg-warning/10",
                    insight.type === "success" && "bg-success/10",
                    insight.type === "info" && "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mt-0.5 shrink-0",
                      insight.type === "warning" && "text-warning",
                      insight.type === "success" && "text-success",
                      insight.type === "info" && "text-primary"
                    )}
                  />

                  <div className="flex-1">
                    <p className="text-sm">{insight.message}</p>

                    <button
                      className={cn(
                        "text-xs font-medium mt-1",
                        insight.type === "warning" && "text-warning",
                        insight.type === "success" && "text-success",
                        insight.type === "info" && "text-primary"
                      )}
                    >
                      {insight.actionText}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}

      <motion.div
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold">Recent Transactions</h3>

            <p className="text-sm text-muted-foreground">
              Your latest expenses
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/reports")}
            className="text-sm text-primary font-medium hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">
                  Date
                </th>

                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">
                  Category
                </th>

                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">
                  Description
                </th>

                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase">
                  Amount
                </th>

                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">
                  Method
                </th>

                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((transaction: any) => {
                const Icon = getCategoryIcon(transaction.category);

                return (
                  <tr
                    key={transaction._id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {/* DATE */}

                    <td className="py-3 px-2 text-sm">
                      {new Date(
                        transaction.transactionDate
                      ).toLocaleDateString()}
                    </td>

                    {/* CATEGORY */}

                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>

                        <span className="text-sm">{transaction.category}</span>
                      </div>
                    </td>

                    {/* DESCRIPTION */}

                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {transaction.description}
                    </td>

                    {/* AMOUNT */}

                    <td className="py-3 px-2 text-right font-numbers font-medium">
                      ₹{transaction.amount.toLocaleString()}
                    </td>

                    {/* PAYMENT METHOD */}

                    <td className="py-3 px-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {transaction.paymentMethod}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {/* EDIT */}

                        <button
                          onClick={() =>
                            navigate(
                              "/dashboard/add-expense",

                              {
                                state: {
                                  transactionId: transaction._id,

                                  amount: transaction.amount,

                                  description: transaction.description,

                                  category: transaction.category,

                                  transactionDate: transaction.transactionDate,

                                  paymentMethod: transaction.paymentMethod,

                                  notes: transaction.notes,
                                },
                              }
                            )
                          }
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction._id)
                          }
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}