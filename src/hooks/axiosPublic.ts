import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const TOKEN_KEY = "royal_auth_token";

export interface ApiError {
  response?: {
    status?: number;
    data?: { message?: string };
  };
  message?: string;
}

export const getApiMessage = (err: unknown, fallback: string): string =>
  (err as ApiError)?.response?.data?.message ?? fallback;

export const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

// ─── In-Memory Cache ──────────────────────────────────────
// Simple TTL cache to avoid duplicate network requests
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

export const getCached = <T>(key: string): T | null => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
};

export const setCache = (key: string, data: unknown, ttlMs: number) => {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const invalidateCache = (key: string) => {
  memoryCache.delete(key);
};

// ─── Axios Instance ───────────────────────────────────────
const axiosPublic = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  withCredentials: false,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// Request interceptor — attach token + content-type
axiosPublic.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response interceptor — error logging only
axiosPublic.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const err = error as ApiError;
    const status = err?.response?.status;
    if (status === 500) {
      console.error("[API] Server error:", err?.response?.data?.message);
    } else if (!status) {
      console.warn("[API] Network error or timeout:", err?.message);
    }
    return Promise.reject(error);
  },
);

export { axiosPublic };
export default axiosPublic;
