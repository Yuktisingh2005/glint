'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Maximize, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Props {
  media: {
    _id: string;
    fileUrl: string;
    uploadedAt: string;
    description?: string;
  };
  onClose: () => void;
  refreshMedia: () => void;
}

export default function LockedMediaPopup({ media, onClose, refreshMedia }: Props) {
  const router = useRouter();
  const [description, setDescription] = useState(media.description || '');
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Auto-save description
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (!token) return;
      setSaving(true);
      axios
        .patch(`${process.env.NEXT_PUBLIC_API_URL}/api/locked-folder/media/${media._id}`, { description }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          refreshMedia();
          setSaving(false);
        })
        .catch(() => setSaving(false));
    }, 800);

    return () => clearTimeout(saveTimeout);
  }, [description]);

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
      alert('Something went wrong while deleting.');
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="relative max-w-3xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      >
        {/* Back Button */}
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Media Preview */}
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

        {/* Timestamp */}
        <p className="text-sm text-center mt-4 text-gray-500 dark:text-gray-400">
          Uploaded on: {new Date(media.uploadedAt).toLocaleString()}
        </p>

        {/* Description Input */}
        <textarea
          placeholder="Write about this media..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-4 p-3 rounded-md border border-gray-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end space-x-4 mt-4">
          <a
            href={media.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 dark:hover:bg-zinc-800 transition"
          >
            <Maximize className="w-4 h-4" />
            <span>Full View</span>
          </a>

          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-zinc-800 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Auto-save status */}
        <p className="text-xs text-right text-gray-400 mt-2">
          {saving ? "Saving..." : "Saved automatically"}
        </p>
      </motion.div>
    </motion.div>
  );
}
