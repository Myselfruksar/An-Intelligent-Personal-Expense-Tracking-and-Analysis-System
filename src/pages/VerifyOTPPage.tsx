import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Wallet, ArrowLeft, ShieldCheck } from 'lucide-react'
import OTPInput from '../components/OTPInput'
import axios from 'axios'
import { toast } from 'sonner'

import { authEndpoints } from '../services/api'
type VerificationType = 'signup' | 'forgot-password'

interface LocationState {

  email?: string
  type?: VerificationType
  name?: string
  phone?: string
  password?: string
  otpToken?: string

}
export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  
  const email = state?.email || 'user@example.com'
  const type: VerificationType = state?.type || 'signup'
  const name = state?.name || ''
  const phone = state?.phone || ''
  const password = state?.password || ''
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  

  const handleOTPComplete = async (otp: string) => {
    try {
      setIsLoading(true);

      // ====================
      // SIGNUP FLOW
      // ====================

      if (type === "signup") {
        const response = await axios.post(
          authEndpoints.REGISTER_API,

          {
            name,
            email,
            phone,
            password,
            otp,
          }
        );

        localStorage.setItem("token", response.data.token);

        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success(response.data.message);

        setIsSuccess(true);

        setTimeout(() => {
          navigate("/dashboard/settings?setup=true")
        }, 1500);
      }

      // ====================
      // FORGOT PASSWORD FLOW
      // ====================
      else {
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/reset-password", {
            state: {
              email,
              otp
            },
          });
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    console.log('[v0] Resending OTP to:', email)
    // Simulate resend OTP
  }

  const getContent = () => {
    if (type === 'forgot-password') {
      return {
        title: 'Verify Your Identity',
        subtitle: 'Enter the 6-digit code sent to',
        backLink: '/forgot-password',
        backText: 'Back to Forgot Password'
      }
    }
    return {
      title: 'Verify Your Email',
      subtitle: 'Enter the 6-digit code sent to',
      backLink: '/register',
      backText: 'Back to Registration'
    }
  }

  const content = getContent()

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

        {/* OTP Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-glow">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>

          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            isLoading={isLoading}
            isSuccess={isSuccess}
            onResend={handleResendOTP}
            resendCooldown={30}
            email={email}
            title={content.title}
            subtitle={content.subtitle}
          />

          {!isSuccess && (
            <Link
              to={content.backLink}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {content.backText}
            </Link>
          )}
        </div>

        {/* Security Note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          For your security, the code will expire in 10 minutes.
          <br />
          Do not share this code with anyone.
        </p>
      </motion.div>
    </div>
  )
}
