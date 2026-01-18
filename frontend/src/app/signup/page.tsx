'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useRouter } from 'next/navigation'; // <-- ADDED

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // <-- ADDED

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
  localStorage.setItem("token", data.token);
}

        setMessage('✅ Successfully registered! Redirecting...');
        setUsername('');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          router.push('/dashboard'); // <-- REDIRECT
        }, 1500);
      } else {
        setMessage(`❌ ${data.message || 'Please try again.'}`);
      }
    } catch (err) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (response: any) => {
  setMessage('');
  try {
    const idToken = response.credential;

    const googleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await googleResponse.json();

    if (googleResponse.ok) {
      // Save token for logged-in state
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setMessage('✅ Google signup successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      setMessage(`❌ ${data.message || 'Google signup failed.'}`);
    }
  } catch (error) {
    setMessage('❌ Google signup error. Please try again.');
  }
};


  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
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

        <header className="absolute top-4 left-6 z-10">
          <Link href="/">
            <Image src="/logo.png" alt="Glint Logo" width={100} height={40} />
          </Link>
        </header>

        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-4xl md:text-5xl font-bold text-pink-400 drop-shadow-lg mb-4"
          >
            Join Glint ✨
          </motion.h1>

          <motion.form
            onSubmit={handleSignup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative w-[320px] sm:w-[400px] p-4 sm:p-6 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-lg border border-white/20 space-y-4"
          >
            {/* Username Field */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />

            {/* Email Field */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-white/60 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition-all duration-300"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>

            {/* Feedback Message */}
            {message && (
              <p className="mt-2 text-center text-sm text-white/80">{message}</p>
            )}

            {/* Divider */}
            <div className="flex items-center justify-center my-4">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="mx-3 text-white/60 text-sm">or</span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>

            {/* Custom Google Signup Button */}
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => setMessage("❌ Google sign-in failed.")}
              useOneTap
              render={(renderProps) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-3xl flex items-center justify-center gap-2 transition duration-300"
                >
                  <FaGoogle className="text-white text-lg" />
                  Continue with Google
                </motion.button>
              )}
            />

            <p className="text-center text-sm text-gray-300 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-400 hover:underline">
                Log In
              </Link>
            </p>
          </motion.form>
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}
