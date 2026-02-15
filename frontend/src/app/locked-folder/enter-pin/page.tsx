"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "@/components/ThemeProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EnterPin() {
  const { darkMode } = useTheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(pin.trim())) {
      return setError("PIN must be 6 digits");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in.");
        setLoading(false);
        return;
      }

      await axios.post(
        `${BASE_URL}/api/locked-folder/verify-pin`,
        { pin: pin.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // PIN correct → set session flag
      sessionStorage.setItem("pin_verified", "true");
      router.replace("/locked-folder/main");
    } catch (err: any) {
      console.error("Error verifying PIN:", err.response || err);
      setError(err.response?.data?.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gradient-to-r from-gray-900 to-black' : 'bg-gradient-to-r from-gray-200 to-gray-400'}`}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Enter PIN</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="border p-3 rounded-lg text-center text-xl tracking-widest"
            placeholder="Enter your PIN"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
