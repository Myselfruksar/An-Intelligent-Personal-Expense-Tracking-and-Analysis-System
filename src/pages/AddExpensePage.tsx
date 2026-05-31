// latest AddExpensePage
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  FileText,
  IndianRupee,
  Sparkles,
  Tag,
  Wallet,
  Loader2,
  CheckCircle2,
  Car,
  Utensils,
  ShoppingCart,
  Film,
  Zap,
  Home,
  GraduationCap,
  Heart,
  Plane,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import axios from "axios";

import { transactionEndpoints } from "@/services/api";

const categories = [
  { id: "food", label: "Food & Dining", icon: Utensils, color: "#4F46E5" },
  { id: "transport", label: "Transport", icon: Car, color: "#06B6D4" },
  { id: "shopping", label: "Shopping", icon: ShoppingCart, color: "#10B981" },
  { id: "entertainment", label: "Entertainment", icon: Film, color: "#F59E0B" },
  { id: "bills", label: "Bills & Utilities", icon: Zap, color: "#EF4444" },
  { id: "housing", label: "Housing", icon: Home, color: "#8B5CF6" },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    color: "#EC4899",
  },
  { id: "health", label: "Health", icon: Heart, color: "#14B8A6" },
  { id: "travel", label: "Travel", icon: Plane, color: "#F97316" },
];

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Wallet },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard },
  { id: "cash", label: "Cash", icon: IndianRupee },
  { id: "netbanking", label: "Net Banking", icon: CreditCard },
];

// AI suggestion mapping
const aiSuggestions: Record<string, string> = {
  uber: "transport",
  ola: "transport",
  rapido: "transport",
  metro: "transport",
  bus: "transport",
  petrol: "transport",
  diesel: "transport",
  fuel: "transport",
  swiggy: "food",
  zomato: "food",
  restaurant: "food",
  cafe: "food",
  coffee: "food",
  lunch: "food",
  dinner: "food",
  breakfast: "food",
  grocery: "food",
  amazon: "shopping",
  flipkart: "shopping",
  myntra: "shopping",
  clothes: "shopping",
  shoes: "shopping",
  netflix: "entertainment",
  spotify: "entertainment",
  movie: "entertainment",
  pvr: "entertainment",
  concert: "entertainment",
  electricity: "bills",
  water: "bills",
  internet: "bills",
  mobile: "bills",
  recharge: "bills",
  rent: "housing",
  maintenance: "housing",
  doctor: "health",
  medicine: "health",
  hospital: "health",
  pharmacy: "health",
  gym: "health",
  course: "education",
  book: "education",
  tuition: "education",
  flight: "travel",
  hotel: "travel",
  booking: "travel",
};

export default function AddExpensePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state;
  const onboarding = new URLSearchParams(location.search).get("onboarding") === "true";

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // AI auto-categorization
  // ==========================================
  // EDIT MODE PREFILL
  // ==========================================

  useEffect(() => {
    if (editData) {
      const reverseCategoryMap: Record<string, string> = {
        "Food & Dining": "food",

        Transport: "transport",

        Shopping: "shopping",

        Entertainment: "entertainment",

        "Bills & Utilities": "bills",

        Housing: "housing",

        Education: "education",

        Health: "health",

        Travel: "travel",
      };

      const reversePaymentMap: Record<string, string> = {
        UPI: "upi",

        CARD: "card",

        CASH: "cash",

        NET_BANKING: "netbanking",
      };

      setFormData({
        amount: editData.amount?.toString() || "",

        description: editData.description || "",

        category: reverseCategoryMap[editData.category] || "",

        date:
          editData.transactionDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],

        paymentMethod: reversePaymentMap[editData.paymentMethod] || "",

        notes: editData.notes || "",
      });
    }
  }, [editData]);

  // ==========================================
  // AI AUTO CATEGORY
  // ==========================================

  useEffect(() => {
    const description = formData.description.toLowerCase();

    for (const [keyword, category] of Object.entries(aiSuggestions)) {
      if (description.includes(keyword)) {
        setAiSuggestion(category);

        return;
      }
    }

    setAiSuggestion(null);
  }, [formData.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");

      const categoryMap: Record<string, string> = {
        food: "Food & Dining",

        transport: "Transport",

        shopping: "Shopping",

        entertainment: "Entertainment",

        bills: "Bills & Utilities",

        housing: "Housing",

        education: "Education",

        health: "Health",

        travel: "Travel",
      };

      const paymentMethodMap: Record<string, string> = {
        upi: "UPI",

        card: "CARD",

        cash: "CASH",

        netbanking: "NET_BANKING",
      };

      // =====================================
      // COMMON PAYLOAD
      // =====================================

      const payload = {
        amount: Number(formData.amount),

        description: formData.description,

        category: categoryMap[formData.category],

        transactionDate: formData.date,

        paymentMethod: paymentMethodMap[formData.paymentMethod],

        notes: formData.notes,
      };

      let response;

      // =====================================
      // UPDATE EXPENSE
      // =====================================

      if (editData?.transactionId) {
        response = await axios.put(
          `${transactionEndpoints.UPDATE_EXPENSE}/${editData.transactionId}`,

          payload,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // =====================================
      // ADD EXPENSE
      // =====================================
      else {
        response = await axios.post(
          transactionEndpoints.ADD_EXPENSE,

          payload,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // =====================================
      // RESPONSE CHECK
      // =====================================

      if (!response.data.success) {
        toast.error(response.data.message);

        return;
      }

      // =====================================
      // CLEAR DASHBOARD CACHE
      // =====================================

      sessionStorage.removeItem("dashboard_analytics");

      sessionStorage.removeItem("dashboard_ai_insights");

      sessionStorage.removeItem("dashboard_recent_transactions");

      console.log("Dashboard cache cleared");
      
      sessionStorage.removeItem("advanced_analytics_cache");

      // =====================================
      // SUCCESS UI
      // =====================================

      setShowSuccess(true);

      toast.success(
        editData?.transactionId
          ? "Expense updated successfully!"
          : "Expense added successfully!"
      );

      // =====================================
      // RESET FORM
      // =====================================

      setTimeout(() => {
        setShowSuccess(false);

        setFormData({
          amount: "",
          category: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          paymentMethod: "",
          notes: "",
        });

      }, 1000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save expense");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      setFormData({ ...formData, category: aiSuggestion });
      setAiSuggestion(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
    {onboarding && (
          <div className="glass rounded-2xl p-5 mb-6 border border-primary/20">
            <h2 className="font-semibold mb-2">
              Start Building Your Financial Insights 🚀
            </h2>

            <p className="text-sm text-muted-foreground">
              Add at least 5–10 transactions to unlock advanced analytics, AI
              insights, and spending reports.
            </p>
          </div>
        )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        
        <div className="mb-6">
          <h2 className="font-heading text-xl font-semibold mb-1">
            {editData?.transactionId ? "Update Expense" : "Add New Expense"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editData?.transactionId
              ? "Update your expense details"
              : "Record your spending with AI-powered categorization"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <IndianRupee className="w-4 h-4 inline mr-1" />
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-numbers">
                ₹
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setFormData({
                      ...formData,
                      amount: value,
                    });
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-numbers text-lg"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description with AI Suggestion */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g., Uber ride to office"
              required
            />
            {aiSuggestion && !formData.category && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1">
                  AI suggests:{" "}
                  <span className="font-medium capitalize">
                    {categories.find((c) => c.id === aiSuggestion)?.label}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Apply
                </button>
              </motion.div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    formData.category === cat.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <cat.icon
                      className="w-5 h-5"
                      style={{ color: cat.color }}
                    />
                  </div>
                  <span className="text-xs text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, paymentMethod: method.id })
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    formData.paymentMethod === method.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <method.icon className="w-4 h-4" />
                  <span className="text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || showSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              showSuccess
                ? "bg-success text-success-foreground"
                : "bg-primary text-primary-foreground hover:opacity-90",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Expense Added!
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Add Expense
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
