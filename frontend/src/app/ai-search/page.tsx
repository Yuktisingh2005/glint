'use client';
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AISearchPage() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const userId = localStorage.getItem('userId'); // or fetch from auth context
    const res = await axios.post('/api/ai/search', { prompt, userId });
    setResults(res.data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white flex flex-col items-center p-8 relative overflow-hidden">
      {/* animated background blur bubbles */}
      <motion.div
        className="absolute w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10"
        animate={{ y: [0, 50, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        style={{ top: '10%', left: '5%' }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -z-10"
        animate={{ y: [0, -50, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        style={{ top: '40%', right: '5%' }}
      />

      <h1 className="text-4xl font-bold mb-8">Search Your Moments with AI ✨</h1>
      <div className="w-full max-w-xl flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the photo (e.g., tree, dog, sunset)..."
          className="flex-grow bg-transparent text-white placeholder-gray-300 outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
        {results.map((item) => (
          <motion.div
            key={item._id}
            className="bg-white/10 p-4 rounded-lg backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src={item.fileUrl} alt="Result" className="rounded-md mb-2" />
            <p className="text-sm text-gray-200">
              {item.detectedLabels?.join(', ')}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
