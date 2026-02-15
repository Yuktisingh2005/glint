"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import TypewriterSlogans from '@/components/TypewriterSlogans';
import Footer from '@/components/Footer';
import { Heart, Lock, Image as ImageIcon, Video, Moon, User } from 'lucide-react';

export default function HeroPage() {
  const features = [
    { icon: ImageIcon, title: "Photos & Videos", desc: "Import and organize all your memories" },
    { icon: Heart, title: "Favorites", desc: "Quick access to your cherished moments" },
    { icon: Lock, title: "Locked Folder", desc: "Keep private photos secure with PIN" },
    { icon: User, title: "Profile", desc: "Personalize your gallery experience" },
    { icon: Moon, title: "Dark/Light Mode", desc: "Switch themes for comfort" },
    { icon: Video, title: "Moments", desc: "Relive your special memories" },
  ];

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
          Welcome to Glint✨
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
            <button className="relative bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 px-8 py-4 rounded-2xl text-white font-semibold transition-all duration-300 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,105,180,0.3)] overflow-hidden group">
              <span className="absolute inset-0 rounded-2xl">
                <span className="absolute h-[2px] w-20 bg-gradient-to-r from-transparent via-pink-400 to-transparent top-0 left-0 animate-[border-beam_3s_linear_infinite]"></span>
              </span>
              Get Started
              <style jsx>{`
                @keyframes border-beam {
                  0% { transform: translateX(-100%); top: 0; left: 0; width: 20%; height: 2px; }
                  25% { transform: translateX(400%); top: 0; left: 0; width: 20%; height: 2px; }
                  25.01% { top: 0; left: 100%; width: 2px; height: 20%; }
                  50% { transform: translateY(400%); top: 0; left: 100%; width: 2px; height: 20%; }
                  50.01% { top: 100%; left: 100%; width: 20%; height: 2px; }
                  75% { transform: translateX(-400%); top: 100%; left: 100%; width: 20%; height: 2px; }
                  75.01% { top: 100%; left: 0; width: 2px; height: 20%; }
                  100% { transform: translateY(-400%); top: 100%; left: 0; width: 2px; height: 20%; }
                }
              `}</style>
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-pink-400"
        >
          Powerful Features
        </motion.h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_0_rgba(255,105,180,0.2)]">
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute h-[2px] w-16 bg-gradient-to-r from-transparent via-pink-400 to-transparent top-0 left-0 animate-[border-beam_3s_linear_infinite]"></span>
                </div>

                <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-pink-400" />
                </div>

                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Showcase */}
      <section className="relative z-10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-pink-400">
            Your Gallery, Your Way
          </h2>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            Experience a modern gallery app that combines beautiful design with powerful features.
            Organize, protect, and cherish your memories like never before.
          </p>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative w-64 h-64 mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotate(${index * 60}deg) translateY(-120px)`,
                }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg"
                >
                  <feature.icon className="w-8 h-8 text-pink-400" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <div className="h-20"></div>
      <Footer />
    </main>
  );
}