import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import axiosPublic from "../hooks/axiosPublic";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "teacher" | "principal" | "admin" | "super-admin";
  slug: string;
  isHardcoded: boolean;
  avatar: {
    url: string | null;
    publicId: string | null;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // App load হলে একবার /me চেক করো
  useEffect(() => {
    axiosPublic
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await axiosPublic.post("/api/auth/login", {
        email,
        password,
      });
      setUser(data.user); // ✅ সব component এ একসাথে update হবে
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    await axiosPublic.post("/api/auth/logout").catch(() => {});
    setUser(null);
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
