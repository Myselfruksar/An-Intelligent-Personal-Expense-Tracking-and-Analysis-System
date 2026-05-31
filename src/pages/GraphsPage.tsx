// my graphPage code here
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
  ComposedChart,
  Scatter
} from 'recharts'

import axios from "axios";
import { useEffect, useState } from "react";
import { dashboardEndpoints } from "@/services/api";



const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

export default function GraphsPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasGraphData = graphData?.monthlyExpenseData?.length > 0;
  const fetchGraphAnalytics = async (forceRefresh = false) => {

    try {

      setLoading(true);

      // =====================================
      // CACHE CHECK
      // =====================================

      const cachedData =
        sessionStorage.getItem(
          "graph_analytics_cache"
        );

      // =====================================
      // USE CACHE
      // =====================================

      if (
        cachedData &&
        !forceRefresh
      ) {

        console.log(
          "Using graph cache"
        );

        setGraphData(
          JSON.parse(cachedData)
        );

        setLoading(false);

        return;

      }

      console.log(
        "Fetching graph API..."
      );

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await axios.get(

          dashboardEndpoints.GRAPH_ANALYTICS,

          {
            headers: {

              Authorization:
                `Bearer ${token}`,

            },
          }
        );
        
      setGraphData(response.data.graphs);

      // =====================================
      // SAVE CACHE
      // =====================================

      sessionStorage.setItem(
        "graph_analytics_cache",
        JSON.stringify(response.data.graphs)
      );

    }

    catch (err) {

      console.log(
        "GRAPH API ERROR =>",
        err
      );

    }

    finally {

      setLoading(false);

    }

  };
  useEffect(() => {
    fetchGraphAnalytics();
  }, []);

  if (loading) {
    return <div className="p-6">Loading graphs...</div>;
  }


  if(!hasGraphData) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-3">
          Graph Analytics Locked 📈
        </h2>

        <p className="text-muted-foreground mb-4">
          Add transactions to unlock financial graphs, spending visualization,
          and savings trends.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <h2 className="font-heading text-xl font-semibold">Visual Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Comprehensive charts and graphs for your financial data
        </p>
      </motion.div>

      {/* Grid of Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">
            Category Distribution
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Annual spending by category
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={graphData?.categoryData || []}
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{
                    stroke: "var(--muted-foreground)",
                    strokeWidth: 1,
                  }}
                >
                  {(graphData?.categoryData || []).map(
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {(graphData?.categoryData || []).map((cat: any) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: cat.color,
                  }}
                />

                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Bar Chart */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">Monthly Expenses</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Expense vs Budget comparison
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData?.monthlyExpenseData || []} barGap={4}>
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
                    "",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="budget"
                  fill="var(--muted)"
                  radius={[4, 4, 0, 0]}
                  name="Budget"
                />
                <Bar
                  dataKey="expense"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Trend Line Chart */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">Expense Trends</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Weekly category-wise spending pattern
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData?.trendData || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
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
                    "",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="food"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Food"
                />
                <Line
                  type="monotone"
                  dataKey="transport"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Transport"
                />
                <Line
                  type="monotone"
                  dataKey="shopping"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Shopping"
                />
                <Line
                  type="monotone"
                  dataKey="bills"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Bills"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Savings Growth Area Chart */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-heading font-semibold mb-1">Savings Growth</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cumulative savings over the year
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData?.savingsGrowthData || []}>
                <defs>
                  <linearGradient
                    id="savingsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                  name="Total Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Combined Analysis Chart */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="font-heading font-semibold mb-1">Financial Overview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Expense, Budget, and Savings combined view
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={graphData?.financialOverview || []}>
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
                  "",
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="budget"
                fill="var(--muted)"
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                fillOpacity={0.3}
                name="Budget"
              />
              <Bar
                dataKey="expense"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                name="Expense"
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="var(--success)"
                strokeWidth={3}
                dot={{ fill: "var(--success)", r: 4 }}
                name="Savings"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
