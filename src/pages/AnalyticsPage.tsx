//latest AnalyticsPage.tsx
import { motion } from 'framer-motion'
import {TrendingUp,TrendingDown,Target,Sparkles,ArrowUpRight,Brain,Lightbulb,PiggyBank} from 'lucide-react'
import {BarChart,Bar,XAxis,YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import { cn } from '../lib/utils'

import axios from "axios";
import { useEffect, useState } from "react";
import { dashboardEndpoints } from "@/services/api";



const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactionCount, setTransactionCount] = useState(0);
  const fetchAdvancedAnalytics = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // ====================================
      // SESSION CACHE
      // ====================================

      const cachedData = sessionStorage.getItem("advanced_analytics_cache");

      if (cachedData && !forceRefresh) {
        console.log("Using Analytics Cache");
        
        const parsedCache = JSON.parse(cachedData);
        
        setAnalyticsData(parsedCache.analytics);
        console.log(" Analytics Cache data",parsedCache);

        setTransactionCount(parsedCache.analytics?.totalTransactions || 0);

        setLoading(false);
        return;
      }

      console.log("Fetching Analytics API...");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        dashboardEndpoints.ADVANCED_ANALYTICS,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("ADVANCED ANALYTICS =>", response.data);

      setAnalyticsData(response.data.analytics);
      setTransactionCount(response.data.analytics?.totalTransactions || 0);

      // ====================================
      // SAVE CACHE
      // ====================================

      sessionStorage.setItem(
        "advanced_analytics_cache",
        JSON.stringify(response.data)
      );
    } catch (err) {
      console.log("ADVANCED ANALYTICS ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (transactionCount < 5) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-3">Analytics Locked 📊</h2>

        <p className="text-muted-foreground mb-4">
          Add at least 5–10 transactions to unlock advanced analytics, AI
          predictions, and smart financial insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Predictions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {analyticsData?.aiPredictions?.map((pred: any, index: number) => (
          <motion.div
            key={pred.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary">
                AI Prediction
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{pred.title}</p>
            <div className="flex items-end gap-2">
              <span className="font-numbers text-2xl font-bold">
                {pred.value}
              </span>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full mb-1",
                  pred.trend === "up" && "bg-destructive/10 text-destructive",
                  pred.trend === "down" && "bg-warning/10 text-warning",
                  pred.trend === "neutral" && "bg-success/10 text-success"
                )}
              >
                {pred.change}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {pred.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Spending Breakdown & Category Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">
            Spending Breakdown
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Current vs Previous Month
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData?.spendingBreakdown || []}
                layout="vertical"
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Bar
                  dataKey="previous"
                  fill="var(--muted)"
                  radius={4}
                  name="Previous"
                />
                <Bar
                  dataKey="current"
                  fill="var(--primary)"
                  radius={4}
                  name="Current"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">
            Budget Utilization
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Percentage of budget used
          </p>
          <div className="space-y-4">
            {analyticsData?.budgetUtilization.map((item:any) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.name}</span>
                  <span
                    className={cn(
                      "font-numbers font-medium",
                      item.value > 100 ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.value, 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={cn(
                      "h-full rounded-full",
                      item.value > 100 ? "bg-destructive" : ""
                    )}
                    style={{
                      backgroundColor:
                        item.value <= 100 ? item.fill : undefined,
                    }}
                  />
                </div>
                {item.value > 100 && (
                  <p className="text-xs text-destructive mt-1">
                    Over budget by {item.value - 100}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Comparison & Savings Growth */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">
            Monthly Comparison
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Income vs Expense vs Savings
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.monthlyComparison || []}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorIncome)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fill="url(#colorExpense)"
                  name="Expense"
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                  name="Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          {...fadeIn}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">Savings Growth</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cumulative savings over time
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.savingsGrowth || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "Total Savings",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--success)"
                  strokeWidth={3}
                  dot={{ fill: "var(--success)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Smart Recommendations */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">
              Smart Savings Recommendations
            </h3>
            <p className="text-xs text-muted-foreground">
              AI-powered suggestions to optimize your budget
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {analyticsData?.smartRecommendations.map(
            (rec: any, index: number) => {
              const Icon =
                rec.difficulty === "Easy"
                  ? Lightbulb
                  : rec.difficulty === "Medium"
                  ? Target
                  : PiggyBank;

              return (
                <motion.div
                  key={rec.title}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.7 + index * 0.1,
                  }}
                  className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">{rec.title}</h4>

                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",

                          rec.difficulty === "Easy" &&
                            "bg-success/10 text-success",

                          rec.difficulty === "Medium" &&
                            "bg-warning/10 text-warning",

                          rec.difficulty === "Hard" &&
                            "bg-destructive/10 text-destructive"
                        )}
                      >
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {rec.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Potential Savings
                    </span>

                    <span className="font-numbers font-semibold text-success">
                      {rec.savings}
                    </span>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      </motion.div>

      {/* Spending Pattern Radar */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.8 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="font-heading font-semibold mb-1">
          Spending Pattern Analysis
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This month vs Last month comparison
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={analyticsData?.spendingPattern || []}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              />
              <Radar
                name="This Month"
                dataKey="A"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.3}
              />
              <Radar
                name="Last Month"
                dataKey="B"
                stroke="var(--secondary)"
                fill="var(--secondary)"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
