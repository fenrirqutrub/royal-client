// DesktopNavbar.tsx
import { memo } from "react";
import { motion } from "framer-motion";
import ProfileButton from "./ProfileButton";
import type { MenuItem } from "./Navbar";
import Logo from "./Logo";

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
    {/* Active pill — rendered FIRST so it sits behind the button text */}
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
    <button
      onClick={() => onClick(item.path)}
      className="relative z-10 px-5 py-2.5 rounded-lg font-medium capitalize transition-colors cursor-pointer outline-none bangla"
      style={{
        color: isActive ? "var(--color-active-text)" : "var(--color-gray)",
      }}
    >
      {item.name}
    </button>
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
      <Logo className="" onClick={onLogoClick} />

      {/* Nav links — center */}
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

      {/* Profile — right */}
      <div className="hidden md:flex items-center flex-shrink-0">
        <ProfileButton size={35} />
      </div>
    </>
  ),
);
DesktopNavbar.displayName = "DesktopNavbar";
export default DesktopNavbar;
