"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export default function CreatePin() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if PIN already exists
  useEffect(() => {
    const checkPin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/api/locked-folder/check-pin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.hasPin) {
          router.replace("/locked-folder/enter-pin");
        }
      } catch (err) {
        console.error("Error checking PIN status:", err);
      }
    };
    checkPin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedPin = pin.trim();
    const trimmedConfirm = confirmPin.trim();

    if (!/^\d{6}$/.test(trimmedPin) || !/^\d{6}$/.test(trimmedConfirm)) {
      setError("PIN must be exactly 6 digits.");
      return;
    }

    if (trimmedPin !== trimmedConfirm) {
      setError("PIN and Confirm PIN do not match.");
      return;
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
        `${BASE_URL}/api/locked-folder/set-pin`,
        { pin: trimmedPin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.replace("/locked-folder/enter-pin"); // go to enter PIN
    } catch (err: any) {
      console.error("Error setting PIN:", err.response || err);
      setError(err.response?.data?.message || "Error setting PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Locked Folder PIN</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="border p-3 rounded-lg text-center text-xl tracking-widest"
            placeholder="Enter 6-digit PIN"
          />
          <input
            type="password"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="border p-3 rounded-lg text-center text-xl tracking-widest"
            placeholder="Confirm PIN"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Setting PIN..." : "Set PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
