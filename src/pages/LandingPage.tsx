// landing page
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Brain,
  CreditCard,
  LineChart,
  PieChart,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../lib/utils'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Smart algorithms analyze your spending patterns and provide personalized recommendations.'
  },
  {
    icon: TrendingUp,
    title: 'Spending Predictions',
    description: 'Forecast your monthly expenses with AI-driven predictions based on historical data.'
  },
  {
    icon: PieChart,
    title: 'Category Analysis',
    description: 'Automatic categorization of expenses with detailed breakdown and visual charts.'
  },
  {
    icon: Shield,
    title: 'Budget Protection',
    description: 'Set smart budgets and receive alerts before you overspend in any category.'
  },
  {
    icon: Zap,
    title: 'Quick Entry',
    description: 'Add expenses in seconds with voice input and smart auto-complete features.'
  },
  {
    icon: LineChart,
    title: 'Real-time Reports',
    description: 'Generate comprehensive reports instantly with export options for PDF and CSV.'
  }
]

const stats = [
  { value: '8+', label: 'Core Modules' },
  { value: '15+', label: 'Analytics Metrics' },
  { value: '100%', label: 'Secure Authentication' },
  { value: 'PDF | Excel', label: 'Report Generation' }
]


export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-lg">ExpenseAI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                How it Works
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border/50"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-muted-foreground">
                Features
              </a>
              <a
                href="#how-it-works"
                className="block py-2 text-muted-foreground"
              >
                How it Works
              </a>
              <a href="#pricing" className="block py-2 text-muted-foreground">
                Pricing
              </a>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center bg-primary text-primary-foreground rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              AI-Powered Financial Management
            </span>
          </motion.div>
          <h2 className="text-lg md:text-xl text-muted-foreground mb-4">
            An Intelligent Personal Expense Tracking and Analysis System
          </h2>

          <motion.h1
            variants={fadeIn}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-balance">Track Your Expenses</span>
            <br />
            <span className="text-gradient">Smarter with AI</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty"
          >
            Intelligent expense tracking that learns your habits, predicts
            spending, and helps you save money effortlessly.
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-glow hover:shadow-glow-sm"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold glass rounded-xl hover:bg-muted/50 transition-all"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeIn}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-numbers text-3xl sm:text-4xl font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-6xl mx-auto mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="glass-strong rounded-2xl p-4 shadow-glow">
            <DashboardPreview />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="text-gradient">Smart Savings</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Everything you need to take control of your finances with AI
              assistance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 hover:shadow-glow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              How <span className="text-gradient">ExpenseAI</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start tracking your expenses in just 3 simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: CreditCard,
                title: "Add Your Expenses",
                description:
                  "Quickly log expenses with smart auto-categorization and voice input support.",
              },
              {
                step: "02",
                icon: BarChart3,
                title: "AI Analyzes Data",
                description:
                  "Our AI processes your spending patterns and identifies saving opportunities.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Get Insights",
                description:
                  "Receive personalized recommendations and track your progress over time.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="font-numbers text-5xl font-bold text-primary/20 mb-4">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="relative z-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-pretty">
              Start managing your expenses smarter with AI-powered analytics,
              budgeting tools, and intelligent financial insights.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-glow"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>

              <span className="font-heading font-bold text-2xl">ExpenseAI</span>
            </div>

            <h3 className="text-lg md:text-xl font-semibold mb-3">
              An Intelligent Personal Expense Tracking and Analysis System
            </h3>

            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base mb-8">
              A web-based personal finance management platform developed using
              the MERN Stack with intelligent analytics, budgeting, reporting,
              and AI-powered financial insights.
            </p>

            <div className="glass rounded-2xl p-6 max-w-xl mx-auto mb-8">
              <p className="text-sm text-muted-foreground mb-2">Developed By</p>

              <h4 className="text-xl font-bold">Ruksar Parveen</h4>

              <p className="text-muted-foreground mt-2">
                Bachelor of Computer Applications (BCA)
              </p>

              <p className="text-muted-foreground">
                Indira Gandhi National Open University (IGNOU)
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
              <span>MERN Stack</span>
              <span>•</span>
              <span>AI Analytics</span>
              <span>•</span>
              <span>JWT Authentication</span>
              <span>•</span>
              <span>PDF | Excel Reports</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2026 ExpenseAI | BCSP-064 Final Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Preview Component
function DashboardPreview() {
  return (
    <div className="rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 bg-muted rounded-md text-xs text-muted-foreground">
            app.expenseai.com/dashboard
          </div>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stats Cards */}
        {[
          { label: 'Total Expense', value: '₹45,234', change: '+12.5%', color: 'text-primary' },
          { label: 'Monthly Budget', value: '₹60,000', change: '75.4% used', color: 'text-secondary' },
          { label: 'Savings', value: '₹14,766', change: '+8.2%', color: 'text-success' },
          { label: 'AI Score', value: '85/100', change: 'Excellent', color: 'text-primary' }
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn("font-numbers text-xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
        
        {/* Chart placeholder */}
        <div className="md:col-span-2 bg-muted/50 rounded-xl p-4">
          <p className="text-sm font-medium mb-3">Monthly Overview</p>
          <div className="flex items-end gap-2 h-24">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t gradient-primary"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-muted/50 rounded-xl p-4">
          <p className="text-sm font-medium mb-3">AI Insights</p>
          <div className="space-y-2">
            {[
              'Food spending increased by 18% this week',
              'You can save ₹3,000 by reducing dining out',
              'Transport expenses are 15% below average'
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
