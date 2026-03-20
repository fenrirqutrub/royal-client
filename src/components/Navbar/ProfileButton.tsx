// src/components/Shared/ProfileButton.tsx
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  LogOut,
  ChevronDown,
  LayoutDashboard,
  UserCircle,
  Key,
  Sun,
  Moon,
} from "lucide-react";
import { FaUserAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeProvider";

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

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> =
  {
    student: {
      label: "ছাত্র/ছাত্রী",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
    },
    teacher: { label: "শিক্ষক", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    principal: {
      label: "অধ্যক্ষ",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.12)",
    },
    admin: { label: "প্রশাসক", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    owner: { label: "মালিক", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };
type MenuItemDef = {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
};

const STAFF_MENU: MenuItemDef[] = [
  {
    key: "profile",
    label: "প্রোফাইল",
    icon: UserCircle,
    path: "/dashboard/profile",
  },
  {
    key: "dashboard",
    label: "ড্যাশবোর্ড",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
];

const MENU_BY_ROLE: Record<string, MenuItemDef[]> = {
  student: [
    {
      key: "profile",
      label: "প্রোফাইল",
      icon: UserCircle,
      path: "/dashboard/profile",
    },
  ],
  teacher: STAFF_MENU,
  principal: STAFF_MENU,
  admin: STAFF_MENU,
  owner: STAFF_MENU,
};
/* ─── Avatar ──────────────────────────────────────────────────────────────── */
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

/* ─── ThemeRow ────────────────────────────────────────────────────────────── */
const ThemeRow = memo(({ onClose }: { onClose: () => void }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = useCallback(() => {
    toggleTheme();
    onClose(); // ✅ theme change-এর পর popup বন্ধ
  }, [toggleTheme, onClose]);

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-between px-4 py-2.5 outline-none cursor-pointer transition-colors"
      style={{ color: "var(--color-text)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "var(--color-active-bg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "transparent";
      }}
    >
      <span className="text-sm font-medium">Theme</span>

      {/* Toggle pill */}
      <div
        className="relative flex items-center rounded-full p-0.5 transition-colors duration-300"
        style={{
          width: 52,
          height: 28,
          backgroundColor: isDark
            ? "rgba(99,102,241,0.25)"
            : "rgba(234,179,8,0.2)",
          border: `1px solid ${isDark ? "rgba(99,102,241,0.4)" : "rgba(234,179,8,0.4)"}`,
        }}
      >
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          animate={{ x: isDark ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: 22,
            height: 22,
            background: isDark
              ? "linear-gradient(135deg,#6366f1,#818cf8)"
              : "linear-gradient(135deg,#fbbf24,#f59e0b)",
            boxShadow: isDark
              ? "0 0 8px rgba(99,102,241,0.5)"
              : "0 0 8px rgba(251,191,36,0.5)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? (
                <Moon size={12} color="white" />
              ) : (
                <Sun size={12} color="white" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </button>
  );
});
ThemeRow.displayName = "ThemeRow";

/* ─── ProfileButton ───────────────────────────────────────────────────────── */
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
  const isStudent = role === "student";

  // outside click → close
  useEffect(() => {
    if (!popupOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node))
        setPopupOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popupOpen]);

  const closePopup = useCallback(() => setPopupOpen(false), []);

  const handleLogout = useCallback(() => {
    closePopup();
    logout();
    onLogout?.();
  }, [closePopup, logout, onLogout]);

  const handleMenuNav = useCallback(
    (path: string) => {
      closePopup();
      navigate(path);
    },
    [closePopup, navigate],
  );

  // ── Loading ──
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
      <motion.button
        onClick={() => navigate("/auth")}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm outline-none cursor-pointer h-10"
        style={{
          backgroundColor: "var(--color-text)",
          color: "var(--color-bg)",
          border: "1px solid var(--color-active-border)",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <Key className="w-4 h-4 flex-shrink-0" />
        <span>লগইন</span>
      </motion.button>
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
                <span
                  className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: badge.color, backgroundColor: badge.bg }}
                >
                  {badge.label}
                </span>
              </div>
            </div>

            {/* ── Theme toggle — শুধু student ── */}
            {isStudent && (
              <div
                style={{ borderBottom: "1px solid var(--color-active-border)" }}
              >
                <ThemeRow onClose={closePopup} />
              </div>
            )}

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
