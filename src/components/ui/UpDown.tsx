// src/components/common/UpDown.tsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router";
import { useTheme } from "../../context/ThemeProvider";
import { FaCrown } from "react-icons/fa";

const UpDown: React.FC = () => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      setScrollDirection(progress <= 0.5 ? "down" : "up");
      setIsVisible(scrollTop > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToBottom = useCallback((): void => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleClick = useCallback((): void => {
    if (scrollDirection === "down") {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [scrollDirection, scrollToBottom, scrollToTop]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 md:bottom-5 md:right-5 z-50"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="relative p-0 border-0 bg-transparent cursor-pointer outline-none"
            aria-label={
              scrollDirection === "up" ? "Scroll to top" : "Scroll to bottom"
            }
          >
            {/* Dark mode glow */}
            {theme === "dark" && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full blur-3xl bg-amber-400/40"
                />
                <motion.div
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-2xl bg-yellow-300/50"
                />
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-3 rounded-full blur-xl bg-amber-300/60"
                />
              </>
            )}

            {/* Crown icon */}
            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
              {theme === "dark" ? (
                <motion.div
                  animate={{
                    filter: [
                      "drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 12px #f59e0b)",
                      "drop-shadow(0 0 14px #fde68a) drop-shadow(0 0 28px #fbbf24)",
                      "drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 12px #f59e0b)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaCrown className="w-9 h-9 md:w-12 md:h-12 text-amber-300" />
                </motion.div>
              ) : (
                <FaCrown
                  className="w-9 h-9 md:w-12 md:h-12 text-amber-500"
                  style={{
                    filter: "drop-shadow(0 2px 6px rgba(245,158,11,0.45))",
                  }}
                />
              )}
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpDown;
