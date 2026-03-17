/**
 * AdminSidebar.tsx
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeProvider";
import { SidebarContent, SPRING_SM, type NavItem } from "./Sidebar.Ui";

// ── Role config ───────────────────────────────────────────────────────────────

const ROLES: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner", color: "#f59e0b" },
  admin: { label: "Admin", color: "#ef4444" },
  principal: { label: "Principal", color: "#8b5cf6" },
  teacher: { label: "Teacher", color: "#3b82f6" },
};

const dashboardNav = (): NavItem[] => [
  {
    name: "Settings",
    icon: Settings,
    subItems: [
      {
        name: "dashboard",
        path: "/dashboard",
        icon: BookOpen,
      },
      {
        name: "Profile",
        path: "/dashboard/profile",
        icon: User,
      },
    ],
  },
];

// ── Nav builder ───────────────────────────────────────────────────────────────

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

const buildNav = (isPrivileged: boolean): NavItem[] => [
  ...dashboardNav(),
  ...contentNav(isPrivileged),
  ...managementNav(isPrivileged),
];

const SECTION_LABELS = ["সেটিংস", "এখানে লেখুন", "ব্যস্খাপনা্"];

// ── AdminSidebar ──────────────────────────────────────────────────────────────

const AdminSidebar = () => {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();

  const role = user?.role ?? "teacher";
  const roleConfig = ROLES[role] ?? ROLES.teacher;
  const isPrivileged = ["admin", "principal", "owner"].includes(role);
  const navGroups = buildNav(isPrivileged);

  // Shared props passed into the pure UI component
  const contentProps = {
    user,
    navGroups,
    sectionLabels: SECTION_LABELS,
    roleConfig,
    onLogout: logout,
    onThemeToggle: toggleTheme,
  };

  useEffect(() => {
    const sync = () => setDesktopOpen(window.innerWidth >= 1024);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <>
      {/* ── Mobile: Sheet ─────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            className="fixed top-4 left-4 z-50 inline-flex h-9 w-9 items-center justify-center
            rounded-md border border-[var(--color-active-border)] bg-[var(--color-bg)]
            shadow-[var(--color-shadow)] cursor-pointer text-[var(--color-text)]"
          >
            <motion.span
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.8 }}
              transition={SPRING_SM}
            >
              <Menu className="w-4 h-4" />
            </motion.span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SidebarContent {...contentProps} />
          </SheetContent>
        </Sheet>
      </div>

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
      >
        <div className="w-[272px]">
          <SidebarContent {...contentProps} />
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
