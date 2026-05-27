import { useEffect } from "react";
import axiosPublic from "../hooks/axiosPublic";

const useSessionHeartbeat = () => {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await axiosPublic.post("/api/sessions/heartbeat", {
          activeSeconds: 30,
        });
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);
};

export default useSessionHeartbeat;
