'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLoginSuccess = async (response: any) => {
    console.log("Google login success", response);
    setMessage('');

    const idToken = response.credential;
    if (!idToken) {
      console.error("idToken is undefined");
      setMessage('❌ Google login failed. Please try again.');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-auth`,
        { idToken }
      );

      console.log("Backend login success", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setMessage('✅ Google login successful! Redirecting...');
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        console.error("No token received from backend");
        setMessage('❌ Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error("Google login error", err.response?.data || err.message);
      setMessage(`❌ ${err.response?.data?.message || 'Google login failed. Please try again.'}`);
    }
  };

  const handleGoogleLoginFailure = (error: any) => {
    console.error('Google login error', error);
    setMessage('❌ Google login failed. Please try again.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setMessage('✅ Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage(`❌ ${data.message || 'Login failed.'}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      {/* Animated Background Blobs */}
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

      {/* Logo Header */}
      <header className="absolute top-4 left-6 z-10">
        <Link href="/">
          <Image src="/logo.png" alt="Glint Logo" width={100} height={40} />
        </Link>
      </header>

      {/* Login Form Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-4xl md:text-5xl font-bold text-pink-400 drop-shadow-lg mb-4"
        >
          Welcome Back to Glint ✨
        </motion.h1>

        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="relative w-[320px] sm:w-[400px] p-4 sm:p-6 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-lg border border-white/20"
        >
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremailid@gmail.com"
              required
              className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1 text-gray-200">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 pr-10 rounded-lg bg-black/30 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-8 right-3 text-white/70 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-400 text-white py-2 rounded-lg font-semibold transition-all duration-300"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Message Display */}
          {message && (
            <p className="mt-2 text-center text-sm text-white/80">{message}</p>
          )}

          {/* Forgot Password */}
          <div className="text-center text-sm text-gray-300 mt-2">
            <Link href="/forgot-password" className="text-pink-400 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-grow border-t border-white/30"></div>
            <span className="mx-3 text-white/60 text-sm">or</span>
            <div className="flex-grow border-t border-white/30"></div>
          </div>

          {/* Google Login */}
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              theme="outline"
              shape="pill"
              useOneTap
              width="100%"
              text="continue_with"
            />
          </GoogleOAuthProvider>

          {/* Don't have an account */}
          <p className="text-center text-sm text-gray-300 mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-pink-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.form>
      </section>
    </main>
  );
}
