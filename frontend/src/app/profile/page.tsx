'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Pencil, Save, CalendarDays, ImagePlus, Lock, X } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePic?: string | null;
  joinedAt: string;
  birthDate?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', birthDate: '' });
  const [picPreview, setPicPreview] = useState<string | null>(null);
  
  // Reset password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ✅ Fetch user on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));
        const userId = decodedPayload.userId;

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({ ...res.data, _id: userId });
        setForm({
          username: res.data.username,
          email: res.data.email,
          birthDate: res.data.birthDate?.slice(0, 10) || '',
        });
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };

    fetchUser();
  }, []);

  // Timer countdown for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // ✅ Save updated user info
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${user._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(prev => prev ? { ...prev, ...res.data } : null);
      setEditMode(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // ✅ Upload profile picture
  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/upload-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(prev => prev ? { ...prev, profilePic: res.data.profilePic } : null);
      setPicPreview(res.data.profilePic);
    } catch (err) {
      console.error('Profile pic upload failed:', err);
    }
  };

  // Reset password functions
  const handleResetPassword = () => {
    setShowResetModal(true);
    setResetMessage('');
    sendOTP();
  };

  const sendOTP = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-reset`, {
        email: user.email,
      });
      setResendTimer(60);
      setResetMessage('✅ OTP sent to your email!');
    } catch (err: any) {
      setResetMessage(`❌ ${err.response?.data?.message || 'Failed to send OTP'}`);
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || !otp || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setResetMessage('❌ Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setResetMessage('❌ Password must be at least 6 characters.');
      return;
    }

    setResetLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        email: user.email,
        otp,
        newPassword,
      });
      setResetMessage('✅ Password reset successfully!');
      setTimeout(() => {
        setShowResetModal(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setResetMessage('');
      }, 2000);
    } catch (err: any) {
      setResetMessage(`❌ ${err.response?.data?.message || 'Reset failed'}`);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="w-[200%] h-[200%] animate-backgroundMove bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-900 opacity-20 rotate-45 absolute top-0 left-0" />
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/30 dark:bg-zinc-800/40 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Picture Upload */}
          <div className="relative">
            <img
              src={
                picPreview || user?.profilePic ||
                'https://ui-avatars.com/api/?name=User&background=666&color=fff'
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-white"
            />
            <label className="absolute bottom-0 right-0 bg-purple-600 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform">
              <ImagePlus className="w-4 h-4 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePicUpload}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="w-full space-y-3 text-center">
            {editMode ? (
              <>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full text-center p-2 rounded bg-white/70 dark:bg-zinc-700"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full text-center p-2 rounded bg-white/70 dark:bg-zinc-700"
                />
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  className="w-full text-center p-2 rounded bg-white/70 dark:bg-zinc-700"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</p>
                {user?.birthDate && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <CalendarDays className="w-4 h-4" /> {new Date(user.birthDate).toLocaleDateString()}
                  </p>
                )}
              </>
            )}

            {/* Join Date */}
            {user?.joinedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Joined on {new Date(user.joinedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {editMode ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all flex items-center gap-1"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            )}
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600 transition-all flex items-center gap-1"
            >
              <Lock className="w-4 h-4" /> Reset Password
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Reset Password</h3>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-all"
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="flex justify-between items-center text-sm">
                  <button
                    onClick={sendOTP}
                    disabled={resendTimer > 0 || resetLoading}
                    className={`font-semibold transition ${
                      resendTimer > 0 || resetLoading ? "text-gray-400 cursor-not-allowed" : "text-purple-500 hover:text-purple-600"
                    }`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>

                {resetMessage && (
                  <p className="text-center text-sm text-gray-600">{resetMessage}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
