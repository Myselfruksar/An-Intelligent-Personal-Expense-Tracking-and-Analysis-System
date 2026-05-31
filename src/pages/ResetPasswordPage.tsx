import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Wallet, Eye, EyeOff, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/utils'
import axios from 'axios'
import { toast } from 'sonner'
import { authEndpoints } from '@/services/api'


interface LocationState {
  email?: string
  otp?: string
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const email = state?.email || ''
  const otp = state?.otp || ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const passwordStrength = () => {
    const password = formData.password
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { label: 'Weak', color: 'bg-destructive' },
      { label: 'Fair', color: 'bg-warning' },
      { label: 'Good', color: 'bg-secondary' },
      { label: 'Strong', color: 'bg-success' }
    ]
    return { score, ...levels[Math.min(score - 1, 3)] }
  }

  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        authEndpoints.RESET_PASSWORD,
        {
          email,
          otp,
          password: formData.password,
        }
      );

      toast.success(response.data.message);

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Password reset failed");
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
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl">ExpenseAI</span>
        </Link>

        {/* Reset Password Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-glow">
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Password Reset Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Your password has been reset successfully. Redirecting you to login...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="font-heading text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-muted-foreground">
                  Create a new strong password for
                </p>
                {email && <p className="text-primary font-medium">{email}</p>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              i <= strength.score ? strength.color : "bg-border"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password strength: <span className={cn(
                          strength.score >= 3 ? "text-success" : 
                          strength.score >= 2 ? "text-warning" : "text-destructive"
                        )}>{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-muted/50 border focus:ring-2 outline-none transition-all pr-12",
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-border focus:border-primary focus:ring-primary/20"
                      )}
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.password !== formData.confirmPassword || !formData.password}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                    "bg-primary text-primary-foreground hover:opacity-90",
                    (isLoading || formData.password !== formData.confirmPassword || !formData.password) && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Security tips */}
        {!isSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-2">Password tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>- Use at least 8 characters</li>
              <li>- Include uppercase and lowercase letters</li>
              <li>- Add numbers and special characters</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  )
}
