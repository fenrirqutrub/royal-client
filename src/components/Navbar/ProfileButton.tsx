// src/components/Shared/ProfileButton.tsx
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  LogOut,
  BookOpen,
  ClipboardList,
  ChevronDown,
  LayoutDashboard,
  UserCircle,
  Key,
} from "lucide-react";
import { FaUserAlt } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../context/AuthContext";

interface ProfileButtonProps {
  onLogout?: () => void;
  size?: number;
}

const POPUP_VARIANTS = {
  hidden: { opacity: 0, scale: 0.92, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: -8 },
} as const;

const POPUP_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.6,
} as const;

// ── Role badge config ────────────────────────────────────────────────────────
const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> =
  {
    student: { label: "Student", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    teacher: {
      label: "Teacher",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
    },
    principal: {
      label: "Principal",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.12)",
    },
    admin: { label: "Admin", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    owner: { label: "Owner", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };

// ── Menu items per role ──────────────────────────────────────────────────────
type MenuItemDef = {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
};

const MENU_BY_ROLE: Record<string, MenuItemDef[]> = {
  student: [
    {
      key: "profile",
      label: "Profile",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
  ],
  teacher: [
    {
      key: "profile",
      label: "Profile",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      key: "add-exam",
      label: "Add Weekly Exam",
      icon: ClipboardList,
      path: "/admin/add-exam",
    },
    {
      key: "add-lesson",
      label: "Add Daily Lesson",
      icon: BookOpen,
      path: "/admin/add-lesson",
    },
  ],
  principal: [
    {
      key: "profile",
      label: "Profile",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ],
  admin: [
    {
      key: "profile",
      label: "Profile",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ],
  owner: [
    {
      key: "profile",
      label: "Profile",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ],
};

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
interface AvatarProps {
  avatarUrl?: string | null;
  size: number;
  className?: string;
}

const Avatar = memo<AvatarProps>(({ avatarUrl, size, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = avatarUrl && !imgError;
  return (
    <span
      className={`rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: showImage
          ? "transparent"
          : "linear-gradient(135deg, var(--color-active-border), var(--color-active-text))",
      }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt="avatar"
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />
      ) : (
        <FaUserAlt
          style={{
            width: size * 0.44,
            height: size * 0.44,
            color: "var(--color-bg)",
          }}
        />
      )}
    </span>
  );
});
Avatar.displayName = "Avatar";

/* ─── ProfileButton ──────────────────────────────────────────────────────── */
const ProfileButton = memo<ProfileButtonProps>(({ onLogout, size = 35 }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const role = user?.role ?? "student";
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.student;
  const menuItems = MENU_BY_ROLE[role] ?? [];
  const avatarUrl = user?.avatar?.url ?? null;
  const displayPhone = user?.phone ?? "";
  const displayName = user?.name ?? "User";

  // close on outside click
  useEffect(() => {
    if (!popupOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node))
        setPopupOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popupOpen]);

  const handleLogout = useCallback(() => {
    setPopupOpen(false);
    logout();
    onLogout?.();
  }, [logout, onLogout]);

  const handleMenuNav = useCallback(
    (path: string) => {
      setPopupOpen(false);
      navigate(path);
    },
    [navigate],
  );

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div
        className="rounded-full animate-pulse"
        style={{
          width: size,
          height: size,
          backgroundColor: "var(--color-active-bg)",
        }}
      />
    );
  }

  // ── Not logged in ──
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm outline-none cursor-pointer bg-[var(--color-text)] text-[var(--color-bg)] border border-[var(--color-active-border)] h-10 "
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Key className="w-4 h-4 flex-shrink-0" />
          <span>লগইন</span>
        </motion.button>
      </div>
    );
  }

  // ── Logged in ──
  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <motion.button
        onClick={() => setPopupOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-xl outline-none cursor-pointer px-1.5 py-1"
        style={{
          backgroundColor: popupOpen ? "var(--color-active-bg)" : "transparent",
          border: "1px solid",
          borderColor: popupOpen ? "var(--color-active-border)" : "transparent",
          transition: "background-color 0.2s, border-color 0.2s",
          minHeight: 44,
          minWidth: 44,
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Profile menu"
        aria-expanded={popupOpen}
      >
        <Avatar avatarUrl={avatarUrl} size={size} />
        <motion.span
          animate={{ rotate: popupOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: "var(--color-gray)" }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl z-[100]"
            variants={POPUP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={POPUP_TRANSITION}
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-active-border)",
              top: "calc(100% + 4px)",
            }}
          >
            {/* ── Profile header ── */}
            <div
              className="px-4 py-3.5 flex items-center gap-3"
              style={{ borderBottom: "1px solid var(--color-active-border)" }}
            >
              <Avatar avatarUrl={avatarUrl} size={42} />
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold leading-tight truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {displayName}
                </p>
                <p
                  className="text-xs leading-tight truncate mt-0.5"
                  style={{ color: "var(--color-gray)" }}
                >
                  {displayPhone || "No phone"}
                </p>
                {/* Role badge */}
                <span
                  className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: badge.color, backgroundColor: badge.bg }}
                >
                  {badge.label}
                </span>
              </div>
            </div>

            {/* ── Theme toggle ── */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-active-border)" }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Theme
              </span>
              <ThemeToggle size={32} animationSpeed={0.5} />
            </div>

            {/* ── Menu items ── */}
            {menuItems.length > 0 && (
              <ul className="py-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => handleMenuNav(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium outline-none cursor-pointer transition-colors"
                        style={{ color: "var(--color-text)" }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = "var(--color-active-bg)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--color-active-text)" }}
                        />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ── Logout ── */}
            <div
              className="py-1.5"
              style={{ borderTop: "1px solid var(--color-active-border)" }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium outline-none cursor-pointer transition-colors"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ProfileButton.displayName = "ProfileButton";
export default ProfileButton;
