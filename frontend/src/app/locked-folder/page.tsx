"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // backend URL

export default function LockedFolderRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/api/locked-folder/check-pin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.hasPin) {
          router.replace("/locked-folder/enter-pin"); // PIN exists → enter PIN
        } else {
          router.replace("/locked-folder/create-pin"); // no PIN → create PIN
        }
      } catch (err) {
        console.error("Error checking PIN:", err.response || err);
        router.replace("/locked-folder/create-pin"); // fallback
      } finally {
        setLoading(false);
      }
    };

    redirect();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Redirecting...</p>;
  return null;
}
