// src/hooks/useAuth.ts
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axiosPublic from "./axiosPublic";

export interface AuthUser {
  email: string;
  name: string;
  role: "teacher" | "principal" | "admin";
  slug: string;
}

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // true until /me resolves

  /* ── fetch current user from cookie on mount ── */
  useEffect(() => {
    axiosPublic
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /* ── login ── */
  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await axiosPublic.post("/api/auth/login", {
        email,
        password,
      });
      setUser(data.user);
      navigate("/dashboard");
    },
    [navigate],
  );

  /* ── logout ── */
  const logout = useCallback(async () => {
    await axiosPublic.post("/api/auth/logout").catch(() => {});
    setUser(null);
    navigate("/");
  }, [navigate]);

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout,
  };
}
