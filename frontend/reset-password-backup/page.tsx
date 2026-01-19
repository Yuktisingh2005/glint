'use client'

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match")
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: null, newPassword: password }),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage("✅ Password reset successful!")
        setTimeout(() => router.push("/login"), 1500)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch {
      setMessage("❌ Failed to reset password.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-purple-500 text-white rounded-md hover:bg-purple-400 transition"
          >
            Reset Password
          </button>
        </form>

        {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
      </div>
    </div>
  )
}

export default ResetPasswordPage
