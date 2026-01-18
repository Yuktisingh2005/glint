'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import MomentPopup from '@/components/MomentPopup';

interface Media {
  _id: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  description?: string;
  favoritedBy?: string[];
}

export default function FavouritesPage() {
  const [favorites, setFavorites] = useState<Media[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [popupMedia, setPopupMedia] = useState<Media | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.userId);
    }
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/media/favorites", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFavorites(res.data);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  useEffect(() => {
    if (userId) fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (mediaId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`http://localhost:5000/api/media/favorite/${mediaId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove it from the list instantly
      setFavorites(prev => prev.filter(media => media._id !== mediaId));
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const groupedFavorites = favorites.reduce((acc: Record<string, Media[]>, moment) => {
    const date = new Date(moment.uploadedAt);
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(moment);
    return acc;
  }, {});

  return (
    <div className="min-h-screen transition-colors duration-700 bg-white text-black relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-backgroundMove bg-gradient-to-r from-yellow-200 via-pink-300 to-blue-200 opacity-30 w-[200%] h-[200%] rotate-45 absolute top-0 left-0" />
      </div>

      {/* Header */}
      <div className="z-10 relative flex justify-between items-center p-4">
        <Link href="/dashboard" className="hover:scale-110 transition-transform">
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold font-mono tracking-wider">Favorites</h1>
        <div className="w-8" /> {/* spacer */}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <div className="text-center mt-32 text-gray-500 text-xl font-semibold animate-fadeIn">
          No favorites yet. Mark memories you love 💜
        </div>
      )}

      {/* Grouped Favorites */}
      <div className="z-10 relative mt-6 space-y-10 p-6 max-w-6xl mx-auto">
        {Object.entries(groupedFavorites).map(([monthYear, mediaList]) => (
          <div key={monthYear}>
            <h2 className="text-lg font-bold text-center mb-4 text-pink-600">{monthYear}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map((media: Media) => (
                <motion.div
                  key={media._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-xl overflow-hidden shadow-md backdrop-blur-md bg-white/20 p-2 cursor-pointer"
                >
                  {/* Heart to unfavorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(media._id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1 bg-white/70 rounded-full hover:scale-110 transition-transform"
                    title="Remove from favorites"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  <div onClick={() => setPopupMedia(media)}>
                    {media.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={media.fileUrl} controls className="w-full h-48 object-cover rounded-md" />
                    ) : (
                      <img src={media.fileUrl} alt="Moment" className="w-full h-48 object-cover rounded-md" />
                    )}
                    <p className="text-sm mt-2 text-center text-gray-600">
                      {new Date(media.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Moment Popup */}
      <AnimatePresence>
        {popupMedia && (
          <MomentPopup
            media={popupMedia}
            onClose={() => setPopupMedia(null)}
            refreshMoments={fetchFavorites}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
