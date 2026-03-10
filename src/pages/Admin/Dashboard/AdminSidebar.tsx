import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

import {
  Menu,
  Triangle,
  Settings,
  LogOut,
  ChevronDown,
  Folder,
  ImageIcon,
  Image,
  FilePlus,
  BookOpen,
  Camera,
  Star,
  HomeIcon,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import ThemeToggle from "../../../components/Navbar/ThemeToggle";
import { useAuth } from "../../../hooks/UseAuth";

interface SubNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface NavItem {
  name: string;
  path?: string;
  icon: LucideIcon;
  subItems?: SubNavItem[];
}

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = user?.role ?? "teacher";
  const isPrivileged =
    role === "admin" || role === "principal" || role === "super-admin";

  useEffect(() => {
    if (window.innerWidth < 1024) setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Nav definitions ──────────────────────────────────────────────────────────

  const navItems: NavItem[] = [
    // { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  ];

  const contentItems: NavItem = {
    name: "এখানে লিখুন",
    icon: Folder,
    subItems: [
      // সবাই দেখতে পাবে
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
        ? [
            {
              name: "নতুন শিক্ষক যোগ করুন",
              path: "/dashboard/add-teacher",
              icon: ImageIcon,
            },
            { name: "Hero", path: "/dashboard/add-hero", icon: Image },
            { name: "Add Notice", path: "/dashboard/add-notice", icon: Image },
          ]
        : []),
    ],
  };

  // Management group — teacher sees only Weekly Exam; admin/principal see all
  const managementItems: NavItem = {
    name: "প্রশ্ন দেখুন",
    icon: Settings,
    subItems: [
      {
        name: "পরিক্ষার প্রশ্ন এডিট",
        path: "/dashboard/management/weekly-exam",
        icon: BookOpen,
      },
      ...(isPrivileged
        ? [
            {
              name: "Photos",
              path: "/dashboard/management/photos",
              icon: Camera,
            },

            {
              name: "Heroes",
              path: "/dashboard/management/heroes",
              icon: Star,
            },
          ]
        : []),
    ],
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName],
    );
  };

  // ── Role config ───────────────────────────────────────────────────────────────
  const roleConfig: Record<
    string,
    { label: string; color: string; panelTitle: string }
  > = {
    admin: {
      label: "Admin",
      color: "#ef4444",
      panelTitle: "Admin Panel",
    },
    principal: {
      label: "Principal",
      color: "#8b5cf6",
      panelTitle: "Principal Panel",
    },
    teacher: {
      label: "Teacher",
      color: "#3b82f6",
      panelTitle: "Teacher Panel",
    },
  };

  const config = roleConfig[role] ?? roleConfig.teacher;

  // ── Collapsible group renderer ────────────────────────────────────────────────
  const renderCollapsibleGroup = (
    item: NavItem,
    groupKey: string,
    activeColor: "emerald" | "indigo" = "emerald",
  ) => {
    const isExpanded = expandedGroups.includes(groupKey);

    const activeClass =
      activeColor === "emerald"
        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium"
        : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium";

    const Icon = item.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-2"
      >
        <motion.button
          onClick={() => toggleGroup(groupKey)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pl-4 mt-1 space-y-1">
                {item.subItems?.map((subItem, subIndex) => {
                  const SubIcon = subItem.icon;
                  const active = isActive(subItem.path);

                  return (
                    <motion.div
                      key={subItem.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: subIndex * 0.03 }}
                    >
                      <Link to={subItem.path}>
                        <motion.div
                          whileHover={{
                            x: active ? 0 : 4,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                            active
                              ? activeClass
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span className="text-sm">{subItem.name}</span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Mobile toggle */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 w-[280px] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Triangle className="w-7 h-7 fill-emerald-600 text-emerald-600" />
                </motion.div>
                {/* ✅ Dynamic panel title based on role */}
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {config.panelTitle}
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5"
              >
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border"
                  style={{
                    backgroundColor: config.color + "18",
                    color: config.color,
                    borderColor: config.color + "44",
                  }}
                >
                  Teacher ID: {user?.slug ?? "—"}
                </span>
              </motion.div>
              <ThemeToggle size={32} animationSpeed={0.5} />
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Dashboard */}
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = item.path ? isActive(item.path) : false;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={item.path || "#"}>
                  <motion.div
                    whileHover={{
                      x: active ? 0 : 4,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="w-5 h-5" />
                    <span
                      className={`text-sm ${active ? "font-semibold" : "font-medium"}`}
                    >
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}

          {/* Content group */}
          {renderCollapsibleGroup(contentItems, "content", "emerald")}

          {/* Management group */}
          {renderCollapsibleGroup(managementItems, "management", "indigo")}
        </nav>

        {/* Footer — user info + logout */}
        <div className="p-4 border-t border-[var(--color-gray)] space-y-2">
          {/* User card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            {/* ✅ Avatar color uses role-specific color */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${config.color}aa, ${config.color})`,
              }}
            >
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </div>

            <Link to="/dashboard/profile">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.name ?? "User"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {/* ✅ Role badge pill uses role-specific color */}
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{
                      backgroundColor: config.color + "22",
                      color: config.color,
                    }}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            </Link>
          </div>
          <Link to="/">
            <motion.h1
              className="w-full flex text-center items-center gap-3 px-4 py-2.5 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              <HomeIcon />
              Home
            </motion.h1>
          </Link>
          {/* Logout */}
          <motion.button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
