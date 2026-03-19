// src/context/AuthContext.tsx
import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../hooks/axiosPublic";

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: "student" | "teacher" | "principal" | "admin" | "owner";
  slug: string;
  isHardcoded: boolean;
  onboardingComplete: boolean;
  avatar: {
    url: string | null;
    publicId: string | null;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ useQuery দিয়ে token always check — stale হলে refetch করবে
  const { data: user = null, isLoading: loading } = useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await axiosPublic.get<{ user: AuthUser }>("/api/auth/me");
      return res.data.user ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5 মিনিট fresh
    retry: false, // 401 এ retry করবে না
    refetchOnWindowFocus: true, // window focus এ recheck
  });

  const setUser = useCallback(
    (u: AuthUser | null) => {
      queryClient.setQueryData(["auth", "me"], u);
    },
    [queryClient],
  );

  const login = useCallback(
    async (phoneOrEmail: string, password: string) => {
      const isEmail = phoneOrEmail.includes("@");
      const payload = isEmail
        ? { email: phoneOrEmail, password }
        : { phone: phoneOrEmail, password };
      const { data } = await axiosPublic.post("/api/auth/login", payload);

      // cache এ set করো — আলাদা /me call লাগবে না
      queryClient.setQueryData(["auth", "me"], data.user);

      if (!data.user.onboardingComplete) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    },
    [navigate, queryClient],
  );

  const logout = useCallback(async () => {
    await axiosPublic.post("/api/auth/logout").catch(() => {});
    // cache clear করো
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    navigate("/", { replace: true });
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        setUser,
        login,
        logout,
      }}
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
