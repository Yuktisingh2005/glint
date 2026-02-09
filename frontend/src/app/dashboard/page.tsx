'use client';
import Upload from '../../components/Upload';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Settings, User, Menu, X,
  Image, Search, Wand2, Lock, Plus, Heart
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import axios from "axios";
import { LogOut } from "lucide-react";


interface UploadedFile {
  url: string;
  date: string;
}

interface User {
  username: string;
  email: string;
  profilePic?: string | null;
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleTheme = () => setDarkMode(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleUploadSuccess = async (url: string) => {
    await fetchUploads();
  };

  const fetchUploads = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`);
      if (response.data && Array.isArray(response.data)) {
        const sorted = response.data
          .map((file: any) => ({
            url: file.fileUrl,
            date: file.uploadedAt,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUploadedFiles(sorted);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className={clsx("min-h-screen transition-colors duration-700", darkMode ? "bg-black text-white" : "bg-white text-black") + " relative overflow-hidden"}>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-backgroundMove bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 opacity-30 w-[200%] h-[200%] rotate-45 absolute top-0 left-0" />
      </div>

      {/* Topbar */}
      <div className="z-10 relative p-4 flex items-center">
        <button onClick={toggleSidebar} className="mr-4">
          {sidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
        <div className="text-2xl font-bold font-mono tracking-wide">
          <div className="w-32 h-8 bg-gray-400 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 12 }}
            className="fixed top-0 left-0 h-full w-64 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-xl z-20 p-6"
          >
            <div className="space-y-6">
              <button onClick={closeSidebar} className="absolute top-4 right-4 hover:scale-110 transition-transform">
                <X className="w-6 h-6" />
              </button>

              <Link href="/profile" onClick={closeSidebar} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                <User /> <span>{user?.username || "User Profile"}</span>
              </Link>

              <button onClick={() => { toggleTheme(); closeSidebar(); }} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                {darkMode ? <Sun /> : <Moon />} <span>Toggle Theme</span>
              </button>

    

              <Link href="/locked-folder" onClick={closeSidebar} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                <Lock /> <span>Locked Folder</span>
              </Link>

              <Link href="/favourites" onClick={closeSidebar} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                <Heart /> <span>Favourites</span>
              </Link>
              <Link
  href="#"
  onClick={() => {
    localStorage.removeItem("token"); // clear JWT
    localStorage.removeItem("user");  // if you stored user info
    window.location.href = "/login";  // redirect
    closeSidebar();
  }}
  className="flex items-center space-x-2 hover:scale-105 transition-transform"
>
  <LogOut /> <span>Logout</span>
</Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar */}
      <div className="z-10 relative mt-10 p-4">
        <div className="mx-auto max-w-4xl rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-lg shadow-md flex justify-around py-4 animate-fadeInUp">
          <Link href="/moments" className="flex flex-col items-center space-y-1 hover:scale-110 transition-transform">
            <Image /> <span>Moments</span>
          </Link>
          <Link href="/ai-search" className="flex flex-col items-center space-y-1 hover:scale-110 transition-transform">
            <Search /> <span>AI Search</span>
          </Link>
          <Link href="/editor" className="flex flex-col items-center space-y-1 hover:scale-110 transition-transform">
            <Wand2 /> <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Upload Button */}
      <div className="fixed bottom-6 left-6 z-10">
        <button
          onClick={() => setOpenUpload(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Upload Popup */}
      {openUpload && (
        <Upload
          closeModal={() => setOpenUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Uploaded Gallery */}
      <div className="z-10 relative mt-10 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-900 p-2">
            {file.url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={file.url} controls className="w-full h-48 object-cover rounded-md" />
            ) : (
              <img src={file.url} alt="Uploaded" className="w-full h-48 object-cover rounded-md" />
            )}
            <p className="text-sm mt-2 text-gray-500 text-center">
              {new Date(file.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
