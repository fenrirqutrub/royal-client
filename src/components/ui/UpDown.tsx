import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeProvider";
import { FaLightbulb } from "react-icons/fa";

const UpDown: React.FC = () => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

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

  /** Smoothly scrolls to the top of the page */
  const scrollToTop = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Smoothly scrolls to the bottom of the page */
  const scrollToBottom = useCallback((): void => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  /** Decides scroll direction on click */
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
            {/* Glow effect in dark mode */}
            {theme === "dark" && (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full blur-3xl bg-yellow-400/50"
                />
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-2xl bg-yellow-400/60"
                />
                <motion.div
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-4 rounded-full blur-xl bg-yellow-400/70"
                />
              </>
            )}

            {/* Bulb icon */}
            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
              <FaLightbulb
                className={`${
                  theme === "dark"
                    ? "text-[#FACC15] drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]"
                    : "text-[#FACC15]"
                } w-8 h-8 md:w-12 md:h-12`}
              />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpDown;
