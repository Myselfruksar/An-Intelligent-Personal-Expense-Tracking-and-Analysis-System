import { motion } from "framer-motion";
import { FileText,Download,Printer,TrendingUp,Wallet,PiggyBank,Receipt,IndianRupee,TrendingDown} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { transactionEndpoints } from "@/services/api";

export default function ReportsPage() {

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // DEFAULT CURRENT MONTH
  // =========================

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${( today.getMonth() + 1 ).toString().padStart(2, "0")}-${today.getFullYear()}`.replace(/\s/g, "");

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState( lastDayOfMonth.toISOString().split("T")[0] );

  const [reportStats, setReportStats] = useState({
    transactionCount: 0,
    averageDailySpending: 0,
    highestSpendingCategory: { category: "-", amount: 0},
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =========================
  // FETCH REPORT
  // =========================

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await axios.get(transactionEndpoints.ALL_TRANSACTIONS, {
        params: {
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }

      setTransactions(response.data.data);
      setReportStats(response.data.reportStats);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // =========================
  // STATS REPORT CALCULATIONS
  // =========================

  const totalExpense = transactions.reduce((acc, item) => acc + item.amount, 0);

  const totalIncome = user.monthlyIncome || 0;
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // =========================
  // EXPORT CSV
  // =========================

  const exportCSV = () => {
    const headers = ["Date", "Category", "Description", "Method", "Amount"];

    const rows = transactions.map((t) => [
      new Date(t.transactionDate).toLocaleDateString(),
      t.category,
      t.description,
      t.paymentMethod,
      t.amount,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expense-report_${formattedDate}.csv`;
    link.click();
  };

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("Expense Report", 14, 20);
    pdf.setFontSize(12);
    pdf.text(`Report Period: ${startDate} to ${endDate}`, 14, 30);

    pdf.text(`Total Expense: Rs.${Math.abs(totalExpense).toLocaleString()}`,14,40);

    pdf.text(`Total Income: Rs.${Number(totalIncome).toLocaleString()}`,14,48 );

    pdf.text(`Net Savings: Rs.${netSavings.toLocaleString()}`, 14, 56);

    pdf.text(`Savings Rate: ${savingsRate}%`, 14, 64);
    pdf.setFontSize(16);

    pdf.text("Key Insights", 14, 80);
    pdf.setFontSize(12);

    pdf.text(`Average Daily Spending: Rs. ${reportStats.averageDailySpending.toLocaleString()}`,14,90);

    pdf.text(
      `Highest Spending Category: ${
        reportStats.highestSpendingCategory?.category
      } (Rs. ${reportStats.highestSpendingCategory?.amount?.toLocaleString()})`,
      14,
      98
    );

    pdf.text(`Savings Rate: ${savingsRate}%`, 14, 106);

    autoTable(pdf, {
      startY: 120,
      head: [["Date", "Category", "Description", "Method", "Amount"]],

      body: transactions.map((t) => [
        new Date(t.transactionDate).toLocaleDateString(),
        t.category,
        t.description,
        t.paymentMethod,
        `Rs.${t.amount}`,
      ]),
    });

    pdf.save(`expense-report_${formattedDate}.pdf`);
  };

  // =========================
  // PRINT REPORT
  // =========================

  const printReport = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} >
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Expense Report
            </h2>

            <p className="text-sm text-muted-foreground">
              Analyze your spending and export reports
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-muted/50 transition-all"
            >
              <FileText className="w-4 h-4" />
              Export CSV
            </button>

            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-muted/50 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* FILTER */}

        <div className="glass rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border"
              />
            </div>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {/* REPORT CONTENT */}

        <div id="report-content">
          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            {/* TOTAL EXPENSE */}

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 text-red-500" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Expense
                  </p>

                  <h3 className="text-2xl font-bold">
                    ₹{Math.abs(totalExpense).toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            {/* TOTAL INCOME */}

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Income
                  </p>

                  <h3 className="text-2xl font-bold">
                    ₹{Number(totalIncome).toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            {/* NET SAVINGS */}

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <PiggyBank className="w-6 h-6 text-blue-500" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Net Savings
                  </p>

                  <h3 className="text-2xl font-bold">
                    ₹{netSavings.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS */}

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6 text-purple-500" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Transactions
                  </p>

                  <h3 className="text-2xl font-bold">
                    {reportStats.transactionCount}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="font-medium mb-2">Key Insights</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" />
                Average daily spending: ₹
                {reportStats.averageDailySpending.toLocaleString()}
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-warning" />
                Highest spending category:{" "}
                {reportStats.highestSpendingCategory?.category} ( ₹
                {reportStats.highestSpendingCategory?.amount?.toLocaleString()})
              </li>
              <li className="flex items-center gap-2">
                {Number(savingsRate) >= 30 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span>Savings rate:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      Number(savingsRate) >= 30
                        ? "font-semibold text-success"
                        : "font-semibold text-destructive"
                    }
                  >
                    {savingsRate}%
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* TABLE */}

          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-heading font-semibold">
                Transaction Details
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-medium">Date</th>

                    <th className="text-left p-4 text-sm font-medium">
                      Category
                    </th>

                    <th className="text-left p-4 text-sm font-medium">
                      Description
                    </th>

                    <th className="text-left p-4 text-sm font-medium">
                      Method
                    </th>

                    <th className="text-right p-4 text-sm font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 text-sm">
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-sm">{transaction.category}</td>

                      <td className="p-4 text-sm">{transaction.description}</td>

                      <td className="p-4 text-sm">
                        {transaction.paymentMethod}
                      </td>

                      <td className="p-4 text-sm text-right font-semibold">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
