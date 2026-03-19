/**
 * AdminSidebar.tsx
 * ✅ Single sidebar — role দেখে conditionally items show করে
 * Student → শুধু Profile
 * Staff/Admin → full nav
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Settings,
  Folder,
  ImageIcon,
  Image,
  FilePlus,
  BookOpen,
  Camera,
  Star,
  User,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeProvider";
import { SidebarContent, SPRING_SM, type NavItem } from "./Sidebar.Ui";

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner", color: "#f59e0b" },
  admin: { label: "Admin", color: "#ef4444" },
  principal: { label: "Principal", color: "#8b5cf6" },
  teacher: { label: "Teacher", color: "#3b82f6" },
  student: { label: "Student", color: "#22c55e" },
};

// ── Nav builders ──────────────────────────────────────────────────────────────

const dashboardNav = (): NavItem[] => [
  {
    name: "Settings",
    icon: Settings,
    subItems: [
      { name: "dashboard", path: "/dashboard", icon: BookOpen },
      { name: "Profile", path: "/dashboard/profile", icon: User },
    ],
  },
];

// Student এর জন্য শুধু Profile
const studentNav = (): NavItem[] => [
  {
    name: "আমার অ্যাকাউন্ট",
    icon: Settings,
    subItems: [{ name: "Profile", path: "/dashboard/profile", icon: User }],
  },
];

const contentNav = (isPrivileged: boolean): NavItem[] => [
  {
    name: "এখানে লিখুন",
    icon: Folder,
    subItems: [
      {
        name: "আজকের পড়া লিখুন",
        path: "/dashboard/add-daily-lesson",
        icon: BookOpen,
      },
      {
        name: "সাপ্তাহিক পরিক্ষার প্রশ্ন",
        path: "/dashboard/add-weekly-exam",
        icon: FilePlus,
      },
      ...(isPrivileged
        ? ([
            {
              name: "নতুন শিক্ষক যোগ করুন",
              path: "/dashboard/add-teacher",
              icon: ImageIcon,
            },
            {
              name: "স্লাইডার যোগ করুন",
              path: "/dashboard/add-hero",
              icon: Image,
            },
            {
              name: "নোটিশ যোগ করুন",
              path: "/dashboard/add-notice",
              icon: Image,
            },
            {
              name: "ছবি যোগ করুন",
              path: "/dashboard/add-photography",
              icon: Image,
            },
          ] satisfies NavItem["subItems"])
        : []),
    ],
  },
];

const managementNav = (isPrivileged: boolean): NavItem[] => [
  {
    name: "ব্যবস্থাপনা দেখুন",
    icon: Folder,
    subItems: [
      {
        name: "পরিক্ষার প্রশ্ন এডিট",
        path: "/dashboard/management/weekly-exam",
        icon: BookOpen,
      },
      {
        name: "প্রতিদিনের পড়া দেখুন",
        path: "/dashboard/management/manage-daily-lesson",
        icon: Star,
      },
      ...(isPrivileged
        ? ([
            {
              name: "ছবি ডিলিট করুন",
              path: "/dashboard/management/photos",
              icon: Camera,
            },
            {
              name: "স্লাইডার মুছুন",
              path: "/dashboard/management/heroes",
              icon: Star,
            },
            {
              name: "নোটিশ মুছুন",
              path: "/dashboard/management/notice",
              icon: Star,
            },
          ] satisfies NavItem["subItems"])
        : []),
    ],
  },
];

const buildNav = (role: string): NavItem[] => {
  // Student → শুধু profile, বাকি সব hidden
  if (role === "student") return studentNav();

  const isPrivileged = ["admin", "principal", "owner"].includes(role);
  return [
    ...dashboardNav(),
    ...contentNav(isPrivileged),
    ...managementNav(isPrivileged),
  ];
};

const SECTION_LABELS: Record<string, string[]> = {
  student: ["অ্যাকাউন্ট"],
  default: ["সেটিংস", "এখানে লেখুন", "ব্যস্খাপনা্"],
};

// ── AdminSidebar ──────────────────────────────────────────────────────────────
const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();

  const role = user?.role ?? "teacher";
  const roleConfig = ROLES[role] ?? ROLES.teacher;
  const navGroups = buildNav(role);
  const sectionLabels =
    role === "student" ? SECTION_LABELS.student : SECTION_LABELS.default;

  const contentProps = {
    user,
    navGroups,
    sectionLabels,
    roleConfig,
    onLogout: logout,
    onThemeToggle: toggleTheme,
  };

  useEffect(() => {
    const sync = () => {
      const lg = window.innerWidth >= 1024;
      setDesktopOpen(lg);
      if (lg) setMobileOpen(false);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <>
      {/* ── Mobile hamburger trigger ───────────────────────────────────── */}
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
        onClick={() => setMobileOpen(true)}
        className={`
          lg:hidden fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center
          rounded-md border border-[var(--color-active-border)] bg-[var(--color-bg)]
          shadow text-[var(--color-text)] cursor-pointer
        `}
      >
        <motion.span
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.8 }}
          transition={SPRING_SM}
        >
          <Menu className="w-4 h-4" />
        </motion.span>
      </button>

      {/* ── Mobile: fixed aside + backdrop ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="lg:hidden fixed inset-0 z-40 bg-[var(--color-bg)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              key="mobile-sidebar"
              id="mobile-sidebar"
              aria-label="Side navigation"
              className="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[280px]
                border-r border-[var(--color-active-border)] bg-[var(--color-bg)]"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <SidebarContent {...contentProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop: sticky aside ─────────────────────────────────────── */}
      <motion.aside
        animate={{ width: desktopOpen ? 272 : 0, opacity: desktopOpen ? 1 : 0 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 28,
          duration: 0.35,
        }}
        className="hidden lg:flex sticky top-0 h-screen border-r border-[var(--color-active-border)]
          bg-[var(--color-bg)] overflow-hidden shrink-0"
        aria-label="Side navigation"
      >
        <div className="w-[272px]">
          <SidebarContent {...contentProps} />
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
