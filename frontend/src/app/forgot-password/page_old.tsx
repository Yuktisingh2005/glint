'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [message, setMessage] = useState("")
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  // ✅ Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (res.ok) {
        setOtpSent(true)
        setResendTimer(60)
        setMessage("✅ OTP sent successfully! Please check your email.")
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (err: any) {
      setMessage("❌ Failed to send OTP.")
    }
  }

  // ✅ Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    setMessage("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("✅ OTP verified successfully!")
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        }, 1500)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (err: any) {
      setMessage("❌ Something went wrong while verifying OTP.")
    } finally {
      setVerifying(false)
    }
  }

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    setMessage("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send-otp`, {
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
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>
        
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-600">Enter your email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
              disabled={otpSent}
            />
          </div>

          <AnimatePresence>
            {otpSent && (
              <motion.div
                key="otp-input"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <label htmlFor="otp" className="text-gray-600">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-2">
            <button
              type="submit"
              className="w-full py-3 bg-pink-500 text-white rounded-md hover:bg-pink-400 focus:outline-none transition"
              disabled={verifying}
            >
              {otpSent ? (verifying ? "Verifying..." : "Verify OTP") : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className={`text-sm font-semibold transition ${
                  resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-pink-400 hover:text-pink-300"
                }`}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          )}

          {message && (
            <div className="mt-4 text-center text-sm text-gray-600">{message}</div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
