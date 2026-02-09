'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (res.ok) {
        setStep(2)
        setResendTimer(60)
        setMessage("✅ OTP sent successfully! Please check your email.")
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (err: any) {
      setMessage("❌ Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("✅ Password reset successfully! Redirecting to login...")
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (err: any) {
      setMessage("❌ Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    setMessage("")
    setLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setResendTimer(60)
        setMessage("✅ OTP resent successfully!")
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch {
      setMessage("❌ Failed to resend OTP.")
    } finally {
      setLoading(false)
    }
  }

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex justify-center items-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-pink-400 mb-2">Reset Password</h2>
          <p className="text-gray-300 text-sm">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter OTP and create new password"}
          </p>
        </div>
        
        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-200 text-sm font-medium">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-400 text-white rounded-lg font-semibold transition-all duration-300"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP and New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-gray-200 text-sm font-medium">Enter OTP</label>
              <input
                type="text"
                id="otp"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-gray-200 text-sm font-medium">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!otpVerified}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-gray-200 text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!otpVerified}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            {!otpVerified && (
              <button
                type="button"
                onClick={async () => {
                  if (!otp) {
                    setMessage("❌ Please enter OTP first.")
                    return
                  }
                  setLoading(true)
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, otp, newPassword: "temp" }),
                    })
                    if (res.status === 400) {
                      const data = await res.json()
                      if (data.message.includes("OTP")) {
                        setMessage("❌ Invalid or expired OTP.")
                      }
                    } else if (res.ok) {
                      setOtpVerified(true)
                      setMessage("✅ OTP verified! Now set your new password.")
                    }
                  } catch {
                    setMessage("❌ Error verifying OTP.")
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-all duration-300"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-400 text-white rounded-lg font-semibold transition-all duration-300"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className={`text-sm font-semibold transition ${
                  resendTimer > 0 || loading ? "text-gray-400 cursor-not-allowed" : "text-pink-400 hover:text-pink-300"
                }`}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {/* Message Display */}
        {message && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-white/80 bg-black/20 p-3 rounded-lg"
          >
            {message}
          </motion.div>
        )}

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-pink-400 transition">
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
