// MobileNavbar.tsx
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bell,
  Camera,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Pen,
  FileQuestion,
  ChevronUp,
  X,
} from "lucide-react";
import type { MenuItem } from "./Navbar";

/* ─── Icon map ──────────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  "/": Home,
  "/notice": Bell,
  "/photography": Camera,
  "/dailylesson": BookOpen,
  "/weekly-exam": ClipboardList,
  "/mcq-exam": FileQuestion,
  "/exams": ClipboardList,
  "/thirdeye": Pen,
  "/people": GraduationCap,
};

const SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.6,
} as const;

const BADGE_SPRING = {
  type: "spring",
  stiffness: 500,
  damping: 22,
  mass: 0.5,
} as const;

const SHEET_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.7,
} as const;

/* ─── ExamSheet — bottom-sheet dropdown for exam sub-items ─────────────── */
interface ExamSheetProps {
  children: readonly { readonly name: string; readonly path: string }[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  activePathname: string;
}

const ExamSheet = memo<ExamSheetProps>(
  ({ children, isOpen, onClose, onNavigate, activePathname }) => {
    const handleItemClick = useCallback(
      (path: string) => {
        onNavigate(path);
        onClose();
      },
      [onNavigate, onClose],
    );

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="exam-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              key="exam-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SHEET_SPRING}
              className="fixed left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
              style={{
                bottom: "4rem", // sits just above bottom tab bar
                backgroundColor: "var(--color-bg)",
                borderTop: "1px solid var(--color-active-border)",
                boxShadow: "0 -8px 32px -4px rgba(0,0,0,0.15)",
              }}
            >
              {/* Handle + title */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-1 rounded-full"
                    style={{ backgroundColor: "var(--color-active-border)" }}
                  />
                  <span
                    className="text-sm font-semibold bangla"
                    style={{ color: "var(--color-gray)" }}
                  >
                    পরিক্ষা বেছে নিন
                  </span>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-1 rounded-full outline-none bg-red-500 text-[var(--color-gray)] transition-colors duration-200 hover:bg-red-600 hover:text-white"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              </div>

              {/* Items */}
              <ul className="px-3 pb-5 space-y-1">
                {children.map((child, i) => {
                  const Icon = ICON_MAP[child.path] ?? ClipboardList;
                  const isChildActive = activePathname.startsWith(child.path);
                  return (
                    <motion.li
                      key={child.path}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SHEET_SPRING, delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => handleItemClick(child.path)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl outline-none bangla transition-colors duration-150"
                        style={{
                          backgroundColor: isChildActive
                            ? "var(--color-active-bg)"
                            : "transparent",
                          color: isChildActive
                            ? "var(--color-active-text)"
                            : "var(--color-gray)",
                          border: isChildActive
                            ? "1px solid var(--color-active-border)"
                            : "1px solid transparent",
                        }}
                      >
                        <Icon
                          className="w-5 h-5 flex-shrink-0"
                          strokeWidth={isChildActive ? 2.2 : 1.8}
                        />
                        <span className="text-base font-medium">
                          {child.name}
                        </span>
                        {isChildActive && (
                          <motion.div
                            layoutId="sheetActiveIndicator"
                            className="ml-auto w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: "var(--color-active-text)",
                            }}
                          />
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  },
);
ExamSheet.displayName = "ExamSheet";

/* ─── BottomTabItem ─────────────────────────────────────────────────────── */
interface BottomTabItemProps {
  item: MenuItem;
  isActive: boolean;
  badge?: number;
  isSheetOpen?: boolean;
  onClick: (item: MenuItem) => void;
}

const BottomTabItem = memo<BottomTabItemProps>(
  ({ item, isActive, badge, isSheetOpen, onClick }) => {
    const Icon = ICON_MAP[item.path] ?? Home;
    const showBadge = typeof badge === "number" && badge > 0;
    const hasChildren = !!item.children?.length;

    return (
      <button
        onClick={() => onClick(item)}
        className="relative flex flex-col items-center justify-center flex-1 py-2 outline-none min-w-0"
        aria-label={item.name}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup={hasChildren ? "dialog" : undefined}
        aria-expanded={hasChildren ? isSheetOpen : undefined}
      >
        {/* Active pill background */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="bottomTabActivePill"
              className="absolute inset-x-1 top-1 bottom-1 rounded-2xl pointer-events-none"
              style={{ backgroundColor: "var(--color-active-bg)" }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={SPRING}
            />
          )}
        </AnimatePresence>

        {/* Icon + badge wrapper */}
        <motion.div
          animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={SPRING}
          className="relative z-10 mb-0.5"
        >
          <Icon
            className="w-5 h-5 transition-colors duration-200"
            style={{
              color: isActive
                ? "var(--color-active-text)"
                : "var(--color-gray)",
              strokeWidth: isActive ? 2.2 : 1.8,
            }}
          />

          {/* Badge */}
          <AnimatePresence>
            {showBadge && (
              <motion.span
                key={badge}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={BADGE_SPRING}
                className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold leading-none pointer-events-none select-none"
                style={{
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  boxShadow: "0 0 0 1.5px var(--color-bg)",
                }}
              >
                {badge > 99 ? "99+" : badge}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Chevron indicator for dropdown items */}
          {hasChildren && (
            <motion.span
              animate={{ rotate: isSheetOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2"
            >
              <ChevronUp
                className="w-2.5 h-2.5"
                style={{
                  color: isActive
                    ? "var(--color-active-text)"
                    : "var(--color-gray)",
                  strokeWidth: 2.5,
                }}
              />
            </motion.span>
          )}
        </motion.div>
      </button>
    );
  },
);
BottomTabItem.displayName = "BottomTabItem";

/* ─── MobileNavbar ──────────────────────────────────────────────────────── */
export interface BadgeCounts {
  [path: string]: number;
}

interface MobileNavbarProps {
  menuConfig: MenuItem[];
  activeItem: string;
  badgeCounts?: BadgeCounts;
  onNavigate: (path: string) => void;
}

const MobileNavbar = memo<MobileNavbarProps>(
  ({ menuConfig, activeItem, badgeCounts = {}, onNavigate }) => {
    const [openSheet, setOpenSheet] = useState<string | null>(null);

    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";

    const handleTabClick = useCallback(
      (item: MenuItem) => {
        if (item.children?.length) {
          // Toggle sheet for this dropdown item
          setOpenSheet((prev) => (prev === item.path ? null : item.path));
        } else {
          setOpenSheet(null);
          onNavigate(item.path);
        }
      },
      [onNavigate],
    );

    const handleCloseSheet = useCallback(() => setOpenSheet(null), []);

    // Find the currently open sheet's menu item
    const openMenuItem = openSheet
      ? menuConfig.find((m) => m.path === openSheet)
      : null;

    return (
      <>
        {/* Exam sub-menu sheet */}
        {openMenuItem?.children && (
          <ExamSheet
            children={openMenuItem.children}
            isOpen={!!openSheet}
            onClose={handleCloseSheet}
            onNavigate={onNavigate}
            activePathname={pathname}
          />
        )}

        {/* Bottom tab bar — mobile only */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{
            backgroundColor: "var(--color-bg)",
            borderTop: "1px solid var(--color-active-border)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 -4px 24px 0 rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-stretch h-16 px-1">
            {menuConfig.map((item) => (
              <BottomTabItem
                key={item.name}
                item={item}
                isActive={activeItem === item.name}
                badge={badgeCounts[item.path]}
                isSheetOpen={openSheet === item.path}
                onClick={handleTabClick}
              />
            ))}
          </div>
        </nav>

        <div className="md:hidden h-16 flex-shrink-0" />
      </>
    );
  },
);
MobileNavbar.displayName = "MobileNavbar";
export default MobileNavbar;
