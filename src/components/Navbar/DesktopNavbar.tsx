// DesktopNavbar.tsx
import { memo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ClipboardList, FileQuestion } from "lucide-react";
import ProfileButton from "./ProfileButton";
import type { MenuItem } from "./Navbar";
import Logo from "./Logo";
import { Notification } from "./Notification";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.75,
} as const;

const DROPDOWN_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.6,
} as const;

/* ─── Child icon map ────────────────────────────────────────────────────── */
const CHILD_ICON_MAP: Record<string, React.ElementType> = {
  "/weekly-exam": ClipboardList,
  "/mcq-exam": FileQuestion,
};

/* ─── DropdownMenu ──────────────────────────────────────────────────────── */
interface DropdownMenuProps {
  children: readonly { readonly name: string; readonly path: string }[];
  isOpen: boolean;
  onNavigate: (path: string) => void;
  activeChildPath: string;
}

const DropdownMenu = memo<DropdownMenuProps>(
  ({ children, isOpen, onNavigate, activeChildPath }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={DROPDOWN_TRANSITION}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl overflow-hidden z-50 py-1.5"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-active-border)",
            boxShadow:
              "0 8px 32px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)",
          }}
        >
          {children.map((child, i) => {
            const Icon = CHILD_ICON_MAP[child.path] ?? ClipboardList;
            const isChildActive = activeChildPath === child.path;
            return (
              <motion.li
                key={child.path}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...DROPDOWN_TRANSITION, delay: i * 0.04 }}
              >
                <button
                  onClick={() => onNavigate(child.path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium bangla transition-colors duration-150 outline-none group"
                  style={{
                    backgroundColor: isChildActive
                      ? "var(--color-active-bg)"
                      : "transparent",
                    color: isChildActive
                      ? "var(--color-active-text)"
                      : "var(--color-gray)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isChildActive)
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "var(--color-active-bg)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isChildActive)
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "transparent";
                  }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      color: isChildActive
                        ? "var(--color-active-text)"
                        : "var(--color-gray)",
                      strokeWidth: isChildActive ? 2.2 : 1.8,
                    }}
                  />
                  <span>{child.name}</span>
                  {isChildActive && (
                    <motion.div
                      layoutId="dropdownActiveIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--color-active-text)" }}
                      transition={SPRING_TRANSITION}
                    />
                  )}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </AnimatePresence>
  ),
);
DropdownMenu.displayName = "DropdownMenu";

/* ─── NavItem ───────────────────────────────────────────────────────────── */
interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  activePathname: string;
  onClick: (path: string) => void;
}

const NavItem = memo<NavItemProps>(
  ({ item, isActive, activePathname, onClick }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);
    const hasChildren = !!item.children?.length;

    const handleClick = useCallback(() => {
      if (hasChildren) {
        setOpen((v) => !v);
      } else {
        onClick(item.path);
      }
    }, [hasChildren, item.path, onClick]);

    const handleChildNav = useCallback(
      (path: string) => {
        onClick(path);
        setOpen(false);
      },
      [onClick],
    );

    // Close on outside click
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Close dropdown on Escape
    useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open]);

    const activeChildPath = hasChildren
      ? (item.children!.find((c) => activePathname.startsWith(c.path))?.path ??
        "")
      : "";

    return (
      <li ref={ref} className="relative">
        {/* Active pill */}
        {isActive && (
          <motion.div
            layoutId="desktopActiveTab"
            className="absolute inset-0 rounded-lg border border-[var(--color-active-border)] pointer-events-none bg-[var(--color-active-bg)]"
            transition={SPRING_TRANSITION}
          />
        )}

        <button
          onClick={handleClick}
          className="relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-medium capitalize transition-colors cursor-pointer outline-none bangla"
          style={{
            color: isActive ? "var(--color-active-text)" : "var(--color-gray)",
          }}
          aria-haspopup={hasChildren ? "listbox" : undefined}
          aria-expanded={hasChildren ? open : undefined}
        >
          <span>{item.name}</span>

          {hasChildren && (
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center"
            >
              <ChevronDown
                className="w-3.5 h-3.5"
                style={{
                  color: isActive
                    ? "var(--color-active-text)"
                    : "var(--color-gray)",
                  strokeWidth: 2.2,
                }}
              />
            </motion.span>
          )}
        </button>

        {hasChildren && (
          <DropdownMenu
            children={item.children!}
            isOpen={open}
            onNavigate={handleChildNav}
            activeChildPath={activeChildPath}
          />
        )}
      </li>
    );
  },
);
NavItem.displayName = "NavItem";

/* ─── DesktopNavbar ─────────────────────────────────────────────────────── */
interface DesktopNavbarProps {
  menuConfig: MenuItem[];
  activeItem: string;
  onNavigate: (path: string) => void;
  onLogoClick: () => void;
}

const DesktopNavbar = memo<DesktopNavbarProps>(
  ({ menuConfig, activeItem, onNavigate, onLogoClick }) => {
    // We need the actual pathname for child active state detection
    // Pull it from window.location since it's already resolved by parent
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";

    return (
      <div className="container mx-auto flex justify-between">
        {/* Logo — left */}
        <Logo className="" onClick={onLogoClick} />

        {/* Nav links — center */}
        <ul className="hidden md:flex items-center space-x-1 relative">
          {menuConfig.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={activeItem === item.name}
              activePathname={pathname}
              onClick={onNavigate}
            />
          ))}
        </ul>

        {/* Profile — right */}
        <div className="hidden md:flex items-center gap-x-5 flex-shrink-0">
          <Notification />
          <ProfileButton size={35} />
        </div>
      </div>
    );
  },
);
DesktopNavbar.displayName = "DesktopNavbar";
export default DesktopNavbar;
