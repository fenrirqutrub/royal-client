// shared.tsx — utilities, types, constants, and shared sub-components
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

// ── Bengali digit converter ────────────────────────────────
export const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

// ── Color palette ──────────────────────────────────────────
export const COLORS = [
  { from: "#6366f1", to: "#8b5cf6", soft: "#ede9fe", text: "#4338ca" },
  { from: "#0ea5e9", to: "#06b6d4", soft: "#e0f2fe", text: "#0369a1" },
  { from: "#f43f5e", to: "#ec4899", soft: "#fce7f3", text: "#be123c" },
] as const;

export type Color = (typeof COLORS)[number];

// ── Exam data shape ────────────────────────────────────────
export interface ExamImage {
  imageUrl: string;
  publicId?: string;
}

export interface Exam {
  ExamNumber: number | string;
  subject: string;
  teacher?: string;
  class: string;
  mark: number | string;
  date: string;
  topics: string;
  images?: (string | ExamImage)[];
}

// ── Animated slide (used inside Swiper) ───────────────────
export const AnimatedSlide = ({
  img,
  isActive,
}: {
  img: string | ExamImage;
  isActive: boolean;
}) => (
  <div className="relative w-full h-full overflow-hidden">
    <motion.img
      src={typeof img === "string" ? img : img.imageUrl}
      alt="exam"
      className="w-full h-full object-cover"
      animate={{ scale: isActive ? 1 : 1.08 }}
      initial={{ scale: 1.08 }}
      transition={{ duration: 6, ease: "linear" }}
    />
  </div>
);

// ── Dot indicators ─────────────────────────────────────────
export const SlideDots = ({
  count,
  active,
  color,
}: {
  count: number;
  active: number;
  color: Color;
}) => (
  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === active ? 26 : 7,
          background: i === active ? "#fff" : "rgba(255,255,255,0.4)",
          boxShadow: i === active ? `0 0 8px ${color.from}90` : "none",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-[7px] rounded-full"
      />
    ))}
  </div>
);

// ── Autoplay progress bar ──────────────────────────────────
export const SlideProgress = ({
  color,
  duration = 3500,
}: {
  color: Color;
  duration?: number;
}) => (
  <div
    className="absolute top-0 left-0 right-0 z-30 h-[3px]"
    style={{ background: "rgba(255,255,255,0.12)" }}
  >
    <motion.div
      className="h-full"
      style={{
        background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
      }}
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  </div>
);

// ── Copy-to-clipboard button ───────────────────────────────
export const CopyBtn = ({ exam, color }: { exam: Exam; color: Color }) => {
  const [copied, setCopied] = useState(false);

  const handle = () => {
    navigator.clipboard.writeText(
      `পরিক্ষা নং = ${exam.ExamNumber}\n${exam.class} = ${exam.subject} - ${exam.mark} নম্বর\n\n${exam.topics}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <motion.button
      onClick={handle}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.04 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border-2"
      style={
        copied
          ? {
              background: `${color.from}18`,
              color: color.from,
              borderColor: `${color.from}55`,
            }
          : {
              background: "transparent",
              color: "#94a3b8",
              borderColor: "#e2e8f0",
            }
      }
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="c"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            key="n"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {copied ? "কপি হয়েছে!" : "কপি করুন"}
    </motion.button>
  );
};
