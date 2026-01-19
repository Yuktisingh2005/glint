"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import TypewriterSlogans from '@/components/TypewriterSlogans';
import Footer from '@/components/Footer';

export default function HeroPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      {/* Enhanced Animated Background */}
      <motion.div
        animate={{ x: [0, 200, -200, 0], y: [0, -100, 100, 0], scale: [1, 1.2, 1, 1.1] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-pink-400 opacity-30 blur-3xl rounded-full top-[-200px] left-[-200px] z-0"
      />
      <motion.div
        animate={{ x: [-200, 100, 0], y: [0, 150, -100], scale: [1, 1.3, 1.2] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] bg-indigo-500 opacity-30 blur-2xl rounded-full bottom-[-150px] right-[-150px] z-0"
      />

      {/* Header with Logo */}
      <header className="absolute top-4 left-6 z-10">
        <Image src="/glint-logo.png" alt="Glint Logo" width={100} height={40} />
      </header>

      {/* Hero Content */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-5xl md:text-6xl font-extrabold text-pink-400 drop-shadow-lg"
        >
          Welcome to Glint ✨
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-4 text-lg md:text-xl font-medium text-gray-300"
        >
          Your Moments, Reimagined.
        </motion.h2>

        <div className="mt-6 mb-10">
          <TypewriterSlogans />
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="mt-4"
        >
          <Link href="/signup">
            <button className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg">
              Get Started
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Add some height so users can scroll to see footer */}
      <div className="h-[100vh]"></div>

      {/* Footer below scroll */}
      <Footer />
    </main>
  );
}
