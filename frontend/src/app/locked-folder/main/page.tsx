'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import UploadLocked from '@/components/UploadLocked';
import LockedMediaPopup from '@/components/LockedMediaPopup';
import { useTheme } from '@/components/ThemeProvider';
import clsx from 'clsx';

interface Media {
  _id: string;
  fileUrl: string;
  title?: string;
  uploadedAt: string;
}

export default function LockedFolderMain() {
  const { darkMode } = useTheme();
  const [lockedMedia, setLockedMedia] = useState<Media[]>([]);
  const [popupMedia, setPopupMedia] = useState<Media | null>(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchLockedMedia = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/locked-folder/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLockedMedia(res.data);
    } catch (err) {
      console.error('Error fetching locked media:', err);
    }
  };

  useEffect(() => {
    fetchLockedMedia();
  }, []);

  const handleSelectAll = () => {
    if (selectedItems.length === lockedMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(lockedMedia.map(m => m._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/locked-folder/media/delete-multiple`, {
        ids: selectedItems,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedItems([]);
      setSelectMode(false);
      fetchLockedMedia();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      alert('Bulk delete failed');
    }
  };

  const groupedMedia = lockedMedia.reduce((acc: Record<string, Media[]>, media) => {
    const date = new Date(media.uploadedAt);
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(media);
    return acc;
  }, {});

  return (
    <div className={clsx("min-h-screen relative overflow-hidden transition-colors duration-700", darkMode ? "bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white" : "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-gray-900")}>
      {/* Background animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, -100, 0], y: [0, -50, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-purple-400/30 blur-3xl rounded-full top-[-100px] right-[-100px]"
        />
        <motion.div
          animate={{ x: [-100, 50, 0], y: [0, 100, -50], scale: [1, 1.3, 1.2] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] bg-pink-500/30 blur-3xl rounded-full bottom-[-150px] left-[-150px]"
        />
      </div>

      {/* Header */}
      <div className="z-10 relative flex justify-between items-center p-4">
        <Link href="/dashboard" className="hover:scale-110 transition-transform">
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold font-mono tracking-wider">Locked Folder</h1>
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
            title="Upload new media"
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
            {selectedItems.length === lockedMedia.length ? 'Deselect All' : 'Select All'}
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
      {lockedMedia.length === 0 && (
        <div className="text-center mt-32 text-gray-500 text-xl font-semibold animate-fadeIn">
          No locked media yet. 🔒
        </div>
      )}

      {/* Grouped media */}
      <div className="z-10 relative mt-6 space-y-10 p-6 max-w-6xl mx-auto">
        {Object.entries(groupedMedia).map(([monthYear, mediaList]) => (
          <div key={monthYear}>
            <h2 className="text-lg font-bold text-center mb-4 text-purple-700">{monthYear}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map((media) => (
                <motion.div
                  key={media._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-xl overflow-hidden shadow-md backdrop-blur-md bg-white/20 p-2 cursor-pointer"
                >
                  {/* Checkbox in select mode */}
                  {selectMode && (
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2 z-10 w-5 h-5"
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
                      <img src={media.fileUrl} alt="Locked Media" className="w-full h-48 object-cover rounded-md" />
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
        <UploadLocked
          closeModal={() => setOpenUpload(false)}
          onUploadSuccess={() => {
            setOpenUpload(false);
            fetchLockedMedia();
          }}
        />
      )}

      {/* Media Popup */}
      <AnimatePresence>
        {popupMedia && (
          <LockedMediaPopup
            media={popupMedia}
            onClose={() => setPopupMedia(null)}
            refreshMedia={fetchLockedMedia}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
