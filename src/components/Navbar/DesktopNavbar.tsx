// DesktopNavbar.tsx
import { memo } from "react";
import { motion } from "framer-motion";
import ProfileButton from "./ProfileButton";
import logo from "../../assets/logo 2.png";
import type { MenuItem } from "./Navbar";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.75,
} as const;

/* ─── NavItem ───────────────────────────────────────────────────────────── */
interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: (path: string) => void;
}

const NavItem = memo<NavItemProps>(({ item, isActive, onClick }) => (
  <li className="relative">
    <button
      onClick={() => onClick(item.path)}
      className="px-5 py-2.5 rounded-lg font-medium capitalize transition-colors cursor-pointer relative z-10 outline-none bangla"
      style={{
        color: isActive ? "var(--color-active-text)" : "var(--color-gray)",
      }}
    >
      {item.name}
    </button>
    {isActive && (
      <motion.div
        layoutId="desktopActiveTab"
        className="absolute inset-0 rounded-lg border pointer-events-none"
        style={{
          backgroundColor: "var(--color-active-bg)",
          borderColor: "var(--color-active-border)",
        }}
        transition={SPRING_TRANSITION}
      />
    )}
  </li>
));
NavItem.displayName = "NavItem";

/* ─── DesktopNavbar ─────────────────────────────────────────────────────── */
interface DesktopNavbarProps {
  menuConfig: MenuItem[];
  activeItem: string;
  onNavigate: (path: string) => void;
  onLogoClick: () => void;
}

const DesktopNavbar = memo<DesktopNavbarProps>(
  ({ menuConfig, activeItem, onNavigate, onLogoClick }) => (
    <>
      {/* Logo — left */}
      <button
        className="cursor-pointer outline-none select-none flex-shrink-0"
        onClick={onLogoClick}
        aria-label="Go home"
      >
        <img
          src={logo}
          alt="Royal Academy"
          className="h-10 md:h-12 w-auto object-contain"
          draggable={false}
        />
      </button>

      {/* Nav links — center, desktop only */}
      <ul className="hidden md:flex items-center space-x-1 relative">
        {menuConfig.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            isActive={activeItem === item.name}
            onClick={onNavigate}
          />
        ))}
      </ul>

      {/* Profile — right, desktop only */}
      <div className="hidden md:flex items-center flex-shrink-0">
        <ProfileButton size={35} />
      </div>
    </>
  ),
);
DesktopNavbar.displayName = "DesktopNavbar";
export default DesktopNavbar;
