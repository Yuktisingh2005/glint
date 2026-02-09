'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import UploadLocked from '@/components/UploadLocked';
import LockedMediaPopup from '@/components/LockedMediaPopup';

interface Media {
  _id: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

export default function LockedFolderMain() {
  const [lockedMedia, setLockedMedia] = useState<Media[]>([]);
  const [popupMedia, setPopupMedia] = useState<Media | null>(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchLockedMedia = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get('http://localhost:5000/api/locked-folder/media', {
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

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/locked-folder/media/delete-many', {
        ids: selectedItems,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedItems([]);
      setDeleteMode(false);
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
    <div className="min-h-screen relative overflow-hidden bg-white text-black transition-colors duration-700">
      {/* Background animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="animate-backgroundMove bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 opacity-30 w-[200%] h-[200%] rotate-45 absolute top-0 left-0" />
      </div>

      {/* Header */}
      <div className="z-10 relative flex justify-between items-center p-4">
        <Link href="/dashboard" className="hover:scale-110 transition-transform">
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-2xl font-bold font-mono tracking-wider">Locked Folder</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            title={deleteMode ? 'Cancel delete mode' : 'Enter delete mode'}
          >
            {deleteMode ? 'Cancel' : 'Delete Mode'}
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

      {/* Empty state */}
      {lockedMedia.length === 0 && (
        <div className="text-center mt-32 text-gray-500 text-xl font-semibold animate-fadeIn">
          No locked media yet.
        </div>
      )}

      {/* Delete selected button */}
      {deleteMode && selectedItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-6 py-2 rounded-full shadow-xl hover:bg-red-700 transition"
          >
            Delete {selectedItems.length} Selected
          </button>
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
                  {/* Checkbox in delete mode */}
                  {deleteMode && (
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

                  <div onClick={() => !deleteMode && setPopupMedia(media)}>
                    {media.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={media.fileUrl} controls className="w-full h-48 object-cover rounded-md" />
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
