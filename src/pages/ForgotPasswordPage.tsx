import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Wallet, ArrowLeft, Mail, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'
import axios from 'axios'
import { toast } from 'sonner'

import { authEndpoints } from '../services/api'


export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await axios.post(
        authEndpoints.SEND_OTP,

        {
          email,
          type: "forgot-password",
        }
      );

      toast.success(response.data.message);

      navigate("/verify-otp", {
        state: {
          email,
          type: "forgot-password"
        },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-4 justify-center">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl">ExpenseAI</span>
        </Link>

        {/* Forgot Password Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-glow ">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground">
              No worries! Enter your email address and we&apos;ll send you a verification code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={cn(
                "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                "bg-primary text-primary-foreground hover:opacity-90",
                (isLoading || !email) && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
