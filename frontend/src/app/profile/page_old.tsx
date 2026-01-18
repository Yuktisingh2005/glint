'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Pencil, Save, CalendarDays, ImagePlus, Lock } from 'lucide-react';

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

        const res = await axios.get(`http://localhost:5000/api/user/${userId}`, {
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

  // ✅ Save updated user info
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      const res = await axios.put(
        `http://localhost:5000/api/user/${user._id}`,
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
      const res = await axios.post(`http://localhost:5000/api/user/upload-pic`, formData, {
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
              className="px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600 transition-all flex items-center gap-1"
            >
              <Lock className="w-4 h-4" /> Reset Password
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
