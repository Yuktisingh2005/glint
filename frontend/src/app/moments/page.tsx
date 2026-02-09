'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Heart, Trash2
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import MomentPopup from '@/components/MomentPopup';
import Upload from '@/components/Upload';

interface Media {
  _id: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  description?: string;
  favoritedBy?: string[];
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<Media[]>([]);
  const [popupMedia, setPopupMedia] = useState<Media | null>(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
    <div className="min-h-screen transition-colors duration-700 bg-white text-black relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-backgroundMove bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 opacity-30 w-[200%] h-[200%] rotate-45 absolute top-0 left-0" />
      </div>

      {/* Header */}
      <div className="z-10 relative flex justify-between items-center p-4">
        <Link href="/dashboard" className="hover:scale-110 transition-transform">
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold font-mono tracking-wider">Moments</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedItems([]);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            title={selectMode ? 'Cancel select mode' : 'Enter select mode'}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          <button
            onClick={() => setOpenUpload(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-md transition-transform hover:scale-110"
            title="Upload new moment"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Select All and Delete buttons */}
      {selectMode && (
        <div className="z-10 relative flex justify-center items-center space-x-4 p-4">
          <button
            onClick={handleSelectAll}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            {selectedItems.length === moments.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete {selectedItems.length} Selected</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {moments.length === 0 && (
        <div className="text-center mt-32 text-gray-500 text-xl font-semibold animate-fadeIn">
          No moments yet. Start saving your memories 💫
        </div>
      )}

      {/* Grouped Moments */}
      <div className="z-10 relative mt-6 space-y-10 p-6 max-w-6xl mx-auto">
        {Object.entries(groupedMoments).map(([monthYear, mediaList]) => (
          <div key={monthYear}>
            <h2 className="text-lg font-bold text-center mb-4 text-purple-700">{monthYear}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map((media: Media) => (
                <motion.div
                  key={media._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-xl overflow-hidden shadow-md backdrop-blur-md bg-white/20 p-2 cursor-pointer"
                >
                  {/* Heart Icon */}
                  {!selectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(media._id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 bg-white/70 rounded-full hover:scale-110 transition-transform"
                      title={media.favoritedBy?.includes(userId!) ? 'Remove from favorites' : 'Add to favorites'}
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
                      className="absolute top-2 left-2 z-10 w-5 h-5"
                      title="Select for deletion"
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

                  <div onClick={() => !selectMode && setPopupMedia(media)}>
                    {media.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video 
                        src={media.fileUrl} 
                        className="w-full h-48 object-cover rounded-md"
                        preload="metadata"
                        muted
                      />
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
