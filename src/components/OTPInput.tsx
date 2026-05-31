import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { CheckCircle2, RefreshCw } from 'lucide-react'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  isLoading?: boolean
  isSuccess?: boolean
  onResend?: () => void
  resendCooldown?: number
  email?: string
  title: string
  subtitle: string
}

export default function OTPInput({
  length = 6,
  onComplete,
  isLoading = false,
  isSuccess = false,
  onResend,
  resendCooldown = 30,
  email,
  title,
  subtitle
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const [countdown, setCountdown] = useState(resendCooldown)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      if (pastedData.length === length) {
        onComplete(pastedData)
      } else {
        inputRefs.current[pastedData.length]?.focus()
      }
    }
  }

  const handleResend = () => {
    if (canResend && onResend) {
      onResend()
      setCountdown(resendCooldown)
      setCanResend(false)
      setOtp(Array(length).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <div className="text-center">
      {isSuccess ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-8"
        >
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">Verified Successfully!</h3>
          <p className="text-muted-foreground">Redirecting you now...</p>
        </motion.div>
      ) : (
        <>
          <h2 className="font-heading text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-2">{subtitle}</p>
          {email && (
            <p className="text-primary font-medium mb-8">{email}</p>
          )}

          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
                  "bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
                  digit ? "border-primary" : "border-border",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              />
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {"Didn't receive the code? "}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Resend Code
              </button>
            ) : (
              <span>
                Resend in <span className="text-primary font-medium">{countdown}s</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
