// src/hooks/axiosSecure.ts
import axios from "axios";
import { TOKEN_KEY } from "./axiosPublic";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120_000,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    if (status === 401) {
      console.warn("[axiosSecure] 401 Unauthorized →", url);
    } else if (status === 403) {
      console.warn("[axiosSecure] 403 Forbidden →", url);
    } else if (status === 404) {
      console.error("[axiosSecure] 404 Not Found →", url);
    }
    return Promise.reject(error);
  },
);

export default axiosSecure;
