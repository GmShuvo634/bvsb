// src/lib/axios.ts
import axios from "axios";
import { Config } from "@/config";

// Create an axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || (Config as any).serverUrl?.https || 'http://localhost:5001',
});

// Request interceptor to attach JWT from localStorage
axiosInstance.interceptors.request.use(cfg => {
  if (typeof window !== "undefined") {
    let token = "";
    try {
      // Prefer our authService storage schema
      const stored = localStorage.getItem("auth") || sessionStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.token || "";
      }
      // Fallbacks for other auth storages
      if (!token) token = localStorage.getItem("token") || ""; // used by AuthContext
      if (!token) token = localStorage.getItem("authToken") || ""; // legacy key
    } catch {}

    token = token.trim().replace(/[^\x00-\x7F]/g, "");
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return cfg;
});

export default axiosInstance;

