import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  LogIn,
  LogOut,
  BookOpen,
  ClipboardList,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../hooks/UseAuth";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ProfileButtonProps {
  onLogout?: () => void;
  size?: number;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
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

const MENU_ITEMS = [
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
] as const;

// Hardcoded admin emails → show "Super Admin" name
const HARDCODED_ADMINS = ["hello@world.com", "mib@gmail.com"];

function getDisplayName(
  user: { email?: string; name?: string } | null,
): string {
  if (!user) return "Teacher";
  if (user.name) return user.name;
  if (user.email && HARDCODED_ADMINS.includes(user.email)) return "Super Admin";
  return "Teacher";
}

/* ─── ProfileButton ──────────────────────────────────────────────────────── */
const ProfileButton = memo<ProfileButtonProps>(({ onLogout, size = 35 }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const displayName = getDisplayName(user);

  /* ── Close on outside click ────────────────────────────────────────── */
  useEffect(() => {
    if (!popupOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popupOpen]);

  /* ── Handlers ──────────────────────────────────────────────────────── */
  const handleLoginClick = useCallback(
    () => navigate("/admin-login"),
    [navigate],
  );
  const handleProfileClick = useCallback(() => setPopupOpen((p) => !p), []);

  const handleMenuNav = useCallback(
    (path: string) => {
      setPopupOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    setPopupOpen(false);
    logout();
    onLogout?.();
  }, [logout, onLogout]);

  /* ── Not logged in ─────────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <motion.button
        onClick={handleLoginClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm outline-none cursor-pointer"
        style={{
          backgroundColor: "var(--color-active-bg)",
          color: "var(--color-active-text)",
          border: "1px solid var(--color-active-border)",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Teacher login"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Login</span>
      </motion.button>
    );
  }

  /* ── Logged in ─────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative">
      {/* ── Avatar trigger ── */}
      <motion.button
        onClick={handleProfileClick}
        className="flex items-center gap-1.5 rounded-xl outline-none cursor-pointer px-1.5 py-1"
        style={{
          backgroundColor: popupOpen ? "var(--color-active-bg)" : "transparent",
          border: "1px solid",
          borderColor: popupOpen ? "var(--color-active-border)" : "transparent",
          transition: "background-color 0.2s, border-color 0.2s",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Profile menu"
        aria-expanded={popupOpen}
      >
        {/* Shield icon as avatar */}
        <span
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: size,
            height: size,
            background:
              "linear-gradient(135deg, var(--color-active-border), var(--color-active-text))",
          }}
        >
          <ShieldCheck
            style={{
              width: size * 0.52,
              height: size * 0.52,
              color: "var(--color-bg)",
            }}
          />
        </span>

        <motion.span
          animate={{ rotate: popupOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:flex"
          style={{ color: "var(--color-gray)" }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </motion.button>

      {/* ── Popup ── */}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-60 rounded-2xl overflow-hidden shadow-2xl z-[100]"
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
              className="px-4 py-3 flex items-center gap-3"
              style={{ borderBottom: "1px solid var(--color-active-border)" }}
            >
              {/* Shield icon */}
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background:
                    "linear-gradient(135deg, var(--color-active-border), var(--color-active-text))",
                }}
              >
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: "var(--color-bg)" }}
                />
              </div>

              {/* Name + email */}
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
                  {user?.email ?? "Royal Academy"}
                </p>
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
            <ul className="py-1.5">
              {MENU_ITEMS.map((item) => {
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
