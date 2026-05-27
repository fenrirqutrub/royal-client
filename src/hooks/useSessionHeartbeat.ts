import { useEffect, useCallback } from "react";
import axiosSecure from "./axiosSecure";

const useSessionHeartbeat = (enabled = true, intervalMs = 30000) => {
  const sendHeartbeat = useCallback(async () => {
    if (!enabled) return;
    if (document.visibilityState === "hidden") return;
    if (!navigator.onLine) return;

    try {
      await axiosSecure.post("/api/sessions/heartbeat", {
        activeSeconds: Math.floor(intervalMs / 1000),
      });
    } catch (error) {
      console.error("Heartbeat failed:", error);
    }
  }, [enabled, intervalMs]);

  useEffect(() => {
    if (!enabled) return;

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, intervalMs);

    const onFocus = () => sendHeartbeat();
    const onVisible = () => {
      if (document.visibilityState === "visible") sendHeartbeat();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, intervalMs, sendHeartbeat]);
};

export default useSessionHeartbeat;
