'use client';
import Upload from '../../components/Upload';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, User, Menu, X, Lock, Plus, Heart, Trash2
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import axios from "axios";
import { LogOut } from "lucide-react";
import MomentPopup from '@/components/MomentPopup';
import { useTheme } from '@/components/ThemeProvider';

interface Media {
  _id: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  description?: string;
  favoritedBy?: string[];
}

interface UserType {
  username: string;
  email: string;
  profilePic?: string | null;
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const [openUpload, setOpenUpload] = useState(false);
  const [moments, setMoments] = useState<Media[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [popupMedia, setPopupMedia] = useState<Media | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.userId);
    }
  }, []);

  const fetchMoments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/moments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMoments(res.data);
    } catch (err) {
      console.error("Error fetching moments:", err);
    }
  };

  useEffect(() => {
    fetchMoments();
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

  const handleSelectAll = () => {
    if (selectedItems.length === moments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(moments.map(m => m._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) return;
    
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/media/delete-many`, {
        ids: selectedItems,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedItems([]);
      setSelectMode(false);
      await fetchMoments();
    } catch (error) {
      console.error("Failed bulk delete", error);
      alert("Bulk delete failed");
    }
  };

  const toggleFavorite = async (mediaId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/favorite/${mediaId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMoments(prev =>
        prev.map(media =>
          media._id === mediaId
            ? {
                ...media,
                favoritedBy: media.favoritedBy?.includes(userId!)
                  ? media.favoritedBy.filter(id => id !== userId)
                  : [...(media.favoritedBy || []), userId!]
              }
            : media
        )
      );
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      await fetchMoments();
    }
  };

  const groupedMoments = moments.reduce((acc: Record<string, Media[]>, moment) => {
    const date = new Date(moment.uploadedAt);
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(moment);
    return acc;
  }, {});

  return (
    <div className={clsx("min-h-screen transition-colors duration-700", darkMode ? "bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white" : "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-gray-900") + " relative overflow-hidden"}>

      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, -100, 0], 
            y: [0, -50, 50, 0], 
            scale: [1, 1.2, 1, 1.1] 
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-pink-400/30 blur-3xl rounded-full top-[-100px] right-[-100px]"
        />
        <motion.div
          animate={{ 
            x: [-100, 50, 0], 
            y: [0, 100, -50], 
            scale: [1, 1.3, 1.2] 
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] bg-purple-500/30 blur-3xl rounded-full bottom-[-150px] left-[-150px]"
        />
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute w-[400px] h-[400px] bg-blue-400/20 blur-2xl rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Topbar */}
      <div className="z-10 relative p-6 flex items-center justify-between">
        <button onClick={toggleSidebar} className="mr-4 hover:scale-110 transition-transform">
          {sidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg"
        >
          ✨ Moments
        </motion.h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedItems([]);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          <button
            onClick={() => setOpenUpload(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-90"
          >
            <Plus className="w-6 h-6" />
          </button>
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
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
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

      {/* Select All and Delete buttons */}
      {selectMode && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 relative flex justify-center items-center space-x-4 p-4"
        >
          <button
            onClick={handleSelectAll}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
          >
            {selectedItems.length === moments.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete {selectedItems.length} Selected</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Upload Popup */}
      {openUpload && (
        <Upload
          closeModal={() => setOpenUpload(false)}
          onUploadSuccess={() => {
            setOpenUpload(false);
            fetchMoments();
          }}
        />
      )}

      {/* Empty state */}
      {moments.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-32"
        >
          <div className="text-6xl mb-4">💫</div>
          <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            No moments yet
          </p>
          <p className="text-gray-500 mt-2">Start saving your memories</p>
        </motion.div>
      )}

      {/* Grouped Moments */}
      <div className="z-10 relative mt-6 space-y-12 p-6 max-w-6xl mx-auto">
        {Object.entries(groupedMoments).map(([monthYear, mediaList]) => (
          <motion.div 
            key={monthYear}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              {monthYear}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map((media: Media) => (
                <motion.div
                  key={media._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl backdrop-blur-lg bg-white/30 dark:bg-black/30 border border-white/20 p-3 cursor-pointer group"
                >
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20" />
                  
                  {/* Heart Icon */}
                  {!selectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(media._id);
                      }}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full hover:scale-125 transition-all duration-300 shadow-lg"
                    >
                      {media.favoritedBy?.includes(userId!) ? (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      ) : (
                        <Heart className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  )}

                  {/* Checkbox in select mode */}
                  {selectMode && (
                    <input
                      type="checkbox"
                      className="absolute top-3 left-3 z-10 w-6 h-6 cursor-pointer accent-purple-500"
                      checked={selectedItems.includes(media._id)}
                      onChange={() =>
                        setSelectedItems((prev) =>
                          prev.includes(media._id)
                            ? prev.filter((id) => id !== media._id)
                            : [...prev, media._id]
                        )
                      }
                    />
                  )}

                  <div onClick={() => !selectMode && setPopupMedia(media)} className="relative">
                    {media.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video 
                        src={media.fileUrl} 
                        className="w-full h-48 object-cover rounded-xl"
                        preload="metadata"
                        muted
                      />
                    ) : (
                      <img src={media.fileUrl} alt="Moment" className="w-full h-48 object-cover rounded-xl" />
                    )}
                    <p className="text-xs mt-3 text-center font-medium opacity-70">
                      {new Date(media.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Moment Popup */}
      <AnimatePresence>
        {popupMedia && (
          <MomentPopup
            media={popupMedia}
            onClose={() => setPopupMedia(null)}
            refreshMoments={fetchMoments}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
