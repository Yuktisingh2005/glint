'use client';

import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface UploadProps {
  closeModal: () => void;
  onUploadSuccess: (fileUrl: string) => void;
}

const Upload: React.FC<UploadProps> = ({ closeModal, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    const file = acceptedFiles[0];
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem("token");

const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/media/upload`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  },
});

      if (response.data?.fileUrl) {
        const url = response.data.fileUrl;
        setFileUrl(url);
        onUploadSuccess(url);

        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        setError('Upload failed: Invalid response');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err?.response?.data?.message || 'Server error'}`);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-30">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl w-full max-w-md text-center"
      >
        <h2 className="text-lg font-semibold mb-4">Upload Media</h2>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-400 p-6 rounded cursor-pointer hover:border-purple-500 transition-colors"
        >
          <input {...getInputProps()} />
          <p>{fileName || "Drag & drop or click to select a file"}</p>
        </div>

        {uploading && <p className="mt-4 text-sm text-purple-600">Uploading...</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {fileUrl && <p className="mt-4 text-green-600 text-sm">Upload successful!</p>}

        <button onClick={closeModal} className="mt-6 px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white">
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default Upload;
