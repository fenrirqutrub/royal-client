// src/hooks/useSessions.ts
import { useState, useEffect, useCallback, useRef } from "react";
import axiosPublic from "./axiosPublic";

export interface SessionEntry {
  _id: string;
  userId: string;
  slug: string | null;
  name: string | null;
  role: string | null;
  ip: string | null;
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
    countryCode: string | null;
  };
  browser: { name: string | null; version: string | null };
  os: { name: string | null; version: string | null };
  device: { vendor: string | null; model: string | null; type: string | null };
  network: { effectiveType: string | null };
  battery: { level: number | null; charging: boolean | null };
  loginAt: string;
  lastActiveAt: string;
  logoutAt: string | null;
  isOnline: boolean;
  durationMinutes: number;
  activeMinutes: number;
}

export interface SessionSummaryEntry {
  _id: string;
  name: string | null;
  role: string | null;
  slug: string | null;
  totalLogins: number;
  totalActiveMinutes: number;
  lastLoginAt: string;
  lastActiveAt: string;
  lastDevice: { type: string | null };
  lastBrowser: { name: string | null };
  lastOS: { name: string | null };
  lastLocation: { city: string | null; country: string | null };
  lastBattery: { level: number | null; charging: boolean | null };
  lastNetwork: { effectiveType: string | null };
  isOnline: boolean;
}

export interface SessionStats {
  totalOnline: number;
  todayLogins: number;
  studentsOnline: number;
  teachersOnline: number;
  staffOnline: number;
}

interface UseSessionsOptions {
  role?: string;
  onlineOnly?: boolean;
  autoRefreshMs?: number;
  limit?: number;
}

export const useSessions = (options: UseSessionsOptions = {}) => {
  const { role, onlineOnly, autoRefreshMs = 30_000, limit = 200 } = options;

  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [summary, setSummary] = useState<SessionSummaryEntry[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalOnline: 0,
    todayLogins: 0,
    studentsOnline: 0,
    teachersOnline: 0,
    staffOnline: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const computeStats = useCallback((data: SessionEntry[]): SessionStats => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const online = data.filter((s) => s.isOnline);
    const today = data.filter((s) => new Date(s.loginAt) >= todayStart);
    const STAFF_ROLES = ["teacher", "principal", "admin", "owner"];

    return {
      totalOnline: online.length,
      todayLogins: today.length,
      studentsOnline: online.filter((s) => s.role === "student").length,
      teachersOnline: online.filter((s) => s.role === "teacher").length,
      staffOnline: online.filter((s) => STAFF_ROLES.includes(s.role ?? ""))
        .length,
    };
  }, []);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      const params: Record<string, string> = { limit: String(limit) };
      if (role) params.role = role;
      if (onlineOnly) params.onlineOnly = "true";

      const [sessRes, sumRes] = await Promise.all([
        axiosPublic.get("/api/sessions", { params }),
        axiosPublic.get("/api/sessions/summary"),
      ]);

      const sessionData: SessionEntry[] = sessRes.data.sessions ?? [];
      setSessions(sessionData);
      setSummary(sumRes.data ?? []);
      setStats(computeStats(sessionData));
      setLastRefreshed(new Date());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "সেশন ডেটা লোড করা যায়নি";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [role, onlineOnly, limit, computeStats]);

  useEffect(() => {
    fetch();
    if (autoRefreshMs > 0) {
      timerRef.current = setInterval(fetch, autoRefreshMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch, autoRefreshMs]);

  return {
    sessions,
    summary,
    stats,
    loading,
    error,
    refresh: fetch,
    lastRefreshed,
  };
};
