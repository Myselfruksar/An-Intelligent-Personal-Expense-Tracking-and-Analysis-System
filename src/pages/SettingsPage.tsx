// SettingsPage.tsx
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Bell,
  Moon,
  Sun,
  Globe,
  CreditCard,
  Shield,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Camera,
  Wallet,
  Target, Chrome,
  Landmark,
  Smartphone
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import axios from "axios";
import { userEndpoints } from "@/services/api";

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("profile");

  const location = useLocation();

  const navigate = useNavigate();

  
  const isSetupMode = new URLSearchParams(location.search).get("setup") === "true";
  
  const monthlyIncomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSetupMode && monthlyIncomeRef.current) {
      monthlyIncomeRef.current.focus();
    }
  }, [isSetupMode]);
  
  const [isSaving, setIsSaving] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
    monthlyIncome: "",
    monthlyBudget: "",
    currency: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    budgetAlerts: true,
    newFeatures: false,
    marketingEmails: false,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
  });

  // ======================
  // LOAD USER
  // ======================

  useEffect(() => {
    const localUser = localStorage.getItem("user");

    // ======================
    // LOAD FROM LOCALSTORAGE FIRST
    // ======================

    if (localUser) {
      const parsedUser = JSON.parse(localUser);

      setProfileData({
        fullName: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        avatar: parsedUser.avatar || "",
        monthlyIncome: String(parsedUser.monthlyIncome || ""),
        monthlyBudget: String(parsedUser.monthlyBudget || ""),
        currency: parsedUser.currency || "INR",
      });
    }

    // ======================
    // BACKGROUND API SYNC
    // ======================

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          userEndpoints.GET_PROFILE,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (err) {
        console.log("Profile sync failed");
      }
    };

    fetchProfile();
  }, []);

  // ======================
  // SAVE PROFILE
  // ======================

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      const response = await axios.put(
        userEndpoints.UPDATE_PROFILE,

        {
          name: profileData.fullName,
          phone: profileData.phone,
          monthlyIncome: Number(profileData.monthlyIncome),
          monthlyBudget: Number(profileData.monthlyBudget),
          currency: profileData.currency,
        },

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

      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.dispatchEvent(new Event("userUpdated"));

      setProfileData((prev) => ({
        ...prev,
        avatar: response.data.user.avatar,
      }));

      toast.success("Profile updated");
      if (isSetupMode) {
        navigate("/dashboard/add-expense?onboarding=true");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Profile update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // ======================
  // CHANGE PASSWORD
  // ======================

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");

      return;
    }

    try {
      setIsSaving(true);

      const response = await axios.put(
        userEndpoints.CHANGE_PASSWORD,

        {
          oldPassword: passwordData.currentPassword,

          newPassword: passwordData.newPassword,
        },

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

      setPasswordData({
        currentPassword: "",

        newPassword: "",

        confirmPassword: "",
      });

      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Password update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Notification preferences saved!");
  };
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },

    {
      id: "security",
      label: "Security",
      icon: Lock,
    },

    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },

    {
      id: "preferences",
      label: "Preferences",
      icon: Globe,
    },
  ];
  

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Settings Header */}
        {!isSetupMode && (
        <div className="mb-6">
          <h2 className="font-heading text-xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>)}
        {isSetupMode && (
          <div className="glass rounded-2xl p-5 mb-6 border border-primary/20">
            <h2 className="text-lg font-semibold mb-2">
              Welcome to ExpenseAI 👋
            </h2>

            <p className="text-sm text-b">
              Before using dashboard analytics and AI insights, <b>please configure
              your financial settings.</b> 
            </p>
          </div>
        )}
        {/* Tab Navigation */}
        {!isSetupMode && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "glass hover:bg-muted"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>)}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-heading font-semibold mb-6">
              Profile Information
            </h3>

            <div className="space-y-4">
              {/* FULL NAME */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,

                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* EMAIL */}
              {!isSetupMode && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border opacity-60 cursor-not-allowed"
                />
              </div>)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Currency Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Currency
                  </label>
                  <select
                    value={profileData.currency}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        currency: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Settings */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Financial Settings
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monthly Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="text"
                        ref={monthlyIncomeRef}
                        value={profileData.monthlyIncome}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (/^\d*$/.test(value)) {
                            setProfileData({
                              ...profileData,

                              monthlyIncome: value,
                            });
                          }
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Enter monthly income"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your total monthly earnings
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monthly Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={profileData.monthlyBudget}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (/^\d*$/.test(value)) {
                            setProfileData({
                              ...profileData,

                              monthlyBudget: value,
                            });
                          }
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your spending limit for the month
                    </p>
                  </div>
                </div>

                {/* Budget vs Income Summary */}
                {profileData.monthlyIncome && profileData.monthlyBudget && (
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Savings Goal</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      ₹
                      {(
                        Number(profileData.monthlyIncome) -
                        Number(profileData.monthlyBudget)
                      ).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(
                        ((Number(profileData.monthlyIncome) -
                          Number(profileData.monthlyBudget)) /
                          Number(profileData.monthlyIncome)) *
                        100
                      ).toFixed(1)}
                      % of your income as savings
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold mb-6">
                Change Password
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-muted/50 border focus:ring-2 outline-none transition-all",
                      passwordData.confirmPassword &&
                        passwordData.newPassword !==
                          passwordData.confirmPassword
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    )}
                    placeholder="Confirm new password"
                  />
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !==
                      passwordData.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={
                    isSaving ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword
                  }
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold mb-4">
                Account Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and data
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-heading font-semibold mb-6">
              Notification Preferences
            </h3>

            <div className="space-y-4">
              {[
                {
                  key: "emailAlerts",
                  label: "Email Alerts",
                  description: "Receive important updates via email",
                },
                {
                  key: "pushNotifications",
                  label: "Push Notifications",
                  description: "Get real-time alerts on your device",
                },
                {
                  key: "weeklyReports",
                  label: "Weekly Reports",
                  description: "Receive weekly expense summaries",
                },
                {
                  key: "budgetAlerts",
                  label: "Budget Alerts",
                  description: "Get notified when nearing budget limits",
                },
                {
                  key: "newFeatures",
                  label: "New Features",
                  description: "Be the first to know about new features",
                },
                {
                  key: "marketingEmails",
                  label: "Marketing Emails",
                  description: "Receive promotional offers and tips",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]:
                          !notifications[
                            item.key as keyof typeof notifications
                          ],
                      })
                    }
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notifications[item.key as keyof typeof notifications]
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                        notifications[item.key as keyof typeof notifications]
                          ? "translate-x-6"
                          : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              ))}

              <button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-70 mt-4"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Save Preferences
              </button>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold mb-6">
                Display Settings
              </h3>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors",
                      theme === "dark"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {theme === "dark" ? (
                      <>
                        <Moon className="w-4 h-4" />
                        Dark
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" />
                        Light
                      </>
                    )}
                  </button>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        language: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold mb-4">
                Connected Accounts
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: "Google",
                    connected: true,
                    icon: Chrome,
                  },

                  {
                    name: "Bank Account",
                    connected: true,
                    icon: Landmark,
                  },

                  {
                    name: "UPI",
                    connected: false,
                    icon: Smartphone,
                  },
                ].map((account) => (
                  <div
                    key={account.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <account.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.connected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <button
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        account.connected
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      {account.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
