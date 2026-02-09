'use client';

import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Props {
  media: {
    _id: string;
    fileUrl: string;
    uploadedAt: string;
  };
  onClose: () => void;
  refreshMedia: () => void;
}

const LockedMediaPopup: React.FC<Props> = ({ media, onClose, refreshMedia }) => {
  const token = localStorage.getItem('token');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/locked-folder/media/${media._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
      refreshMedia();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete media.');
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="relative max-w-3xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="mt-8">
          {media.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video 
              src={media.fileUrl} 
              controls 
              className="w-full rounded-lg max-h-[50vh] object-cover"
              preload="metadata"
              muted
            />
          ) : (
            <img src={media.fileUrl} alt="Locked Media" className="w-full rounded-lg max-h-[60vh] object-contain" />
          )}
        </div>

        <p className="text-sm text-center mt-4 text-gray-500 dark:text-gray-400">
          Uploaded on: {new Date(media.uploadedAt).toLocaleString()}
        </p>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-zinc-800 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LockedMediaPopup;
