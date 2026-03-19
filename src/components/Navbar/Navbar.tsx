// src/components/Shared/Navbar.tsx
import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import ProfileButton from "./ProfileButton";
import logo from "../../assets/logo 2.png";
import { useAuth } from "../../context/AuthContext";

type MenuItem = { readonly name: string; readonly path: string };

const BASE_MENU: MenuItem[] = [
  { name: "হোম", path: "/" },
  { name: "নোটিশ", path: "/notice" },
  { name: "ফটোগ্রাফি", path: "/photography" },
];

const AUTH_MENU: MenuItem[] = [
  { name: "প্রতিদিনের পড়া", path: "/dailylesson" },
  { name: "সাপ্তাহিক পরিক্ষা", path: "/weekly-exam" },
];

// শুধু principal / admin / owner দেখতে পাবে
const PRIVILEGED_MENU: MenuItem[] = [{ name: "Students", path: "/students" }];

const PRIVILEGED_ROLES = ["principal", "admin", "owner"];

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.75,
} as const;
const DRAWER_VARIANTS = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
} as const;
const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;
const ICON_VARIANTS = {
  hidden: { opacity: 0, rotate: -90, scale: 0.7 },
  visible: { opacity: 1, rotate: 0, scale: 1.0 },
  exit: { opacity: 0, rotate: 90, scale: 0.7 },
} as const;

const NAV_BASE_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  willChange: "transform",
};

/* ─── NavItem (desktop) ─────────────────────────────────────────────────── */
interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: (p: string) => void;
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

/* ─── MobileNavItem ─────────────────────────────────────────────────────── */
const MobileNavItem = memo<NavItemProps>(({ item, isActive, onClick }) => (
  <li>
    <button
      onClick={() => onClick(item.path)}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors relative overflow-hidden outline-none"
      style={{
        color: isActive ? "var(--color-active-text)" : "var(--color-gray)",
      }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          layoutId="mobileActiveBg"
          style={{ backgroundColor: "var(--color-active-bg)" }}
          transition={SPRING_TRANSITION}
        />
      )}
      <span className="text-lg font-semibold capitalize relative z-10 bangla">
        {item.name}
      </span>
      {isActive && (
        <span
          className="text-sm ml-2 relative z-10"
          style={{ color: "var(--color-gray)" }}
        >
          Current
        </span>
      )}
    </button>
  </li>
));
MobileNavItem.displayName = "MobileNavItem";

/* ─── Navbar ────────────────────────────────────────────────────────────── */
const Navbar = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const role = user?.role ?? "";
  const isPrivileged = PRIVILEGED_ROLES.includes(role);

  const MENU_CONFIG = useMemo<MenuItem[]>(() => {
    if (!isAuthenticated) return BASE_MENU;
    return [
      ...BASE_MENU,
      ...AUTH_MENU,
      ...(isPrivileged ? PRIVILEGED_MENU : []),
    ];
  }, [isAuthenticated, isPrivileged]);

  const activeItem = useMemo(() => {
    const path = location.pathname;
    return (
      MENU_CONFIG.find((m) =>
        m.path === "/" ? path === "/" : path.startsWith(m.path),
      )?.name ?? ""
    );
  }, [location.pathname, MENU_CONFIG]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        rafRef.current = null;
      });
    };
    setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavigation = useCallback(
    (path: string) => {
      setMobileMenuOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogo = useCallback(() => navigate("/"), [navigate]);

  const navStyle = useMemo<React.CSSProperties>(
    () => ({
      ...NAV_BASE_STYLE,
      borderColor: scrolled ? "var(--color-active-border)" : "transparent",
    }),
    [scrolled],
  );

  return (
    <>
      <nav
        className={`fixed z-50 left-0 right-0 top-0 transition-[padding,border-color,box-shadow] duration-300 ${scrolled ? "py-3 border-b shadow-lg" : "py-4"}`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <button
              className="cursor-pointer outline-none select-none"
              onClick={handleLogo}
              aria-label="Go home"
            >
              <img
                src={logo}
                alt="Royal Academy"
                className="h-10 md:h-12 w-auto object-contain"
                draggable={false}
              />
            </button>

            <ul className="hidden md:flex items-center space-x-1 relative">
              {MENU_CONFIG.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={activeItem === item.name}
                  onClick={handleNavigation}
                />
              ))}
            </ul>

            <div className="flex items-center space-x-2">
              <ProfileButton size={35} />
              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="md:hidden p-2.5 rounded-lg z-[60] relative outline-none"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  color: "var(--color-text)",
                }}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={String(mobileMenuOpen)}
                    variants={ICON_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="flex"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] md:hidden bg-[var(--color-bg)] backdrop-blur-sm"
              variants={BACKDROP_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md z-[56] md:hidden shadow-2xl overflow-hidden"
              variants={DRAWER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <div className="flex flex-col h-full">
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={{ borderColor: "var(--color-active-border)" }}
                >
                  <img
                    src={logo}
                    alt="Royal Academy"
                    className="h-9 w-auto object-contain"
                    draggable={false}
                  />
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full outline-none"
                    style={{
                      backgroundColor: "var(--color-active-bg)",
                      color: "var(--color-text)",
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <nav className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-1">
                    {MENU_CONFIG.map((item) => (
                      <MobileNavItem
                        key={item.name}
                        item={item}
                        isActive={activeItem === item.name}
                        onClick={handleNavigation}
                      />
                    ))}
                  </ul>
                </nav>
                <div
                  className="p-6 border-t"
                  style={{ borderColor: "var(--color-active-border)" }}
                >
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--color-gray)" }}
                  >
                    &copy; ২০২৪ সর্বস্বত্ব সংরক্ষিত — রয়েল একাডেমি
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
