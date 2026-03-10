// DailyLessonModal.tsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, BookOpen } from "lucide-react";
import { toBn, type Color } from "../../utility/shared";
import type { DailyLessonItem } from "./DailyLessonCard";
import book from "../../assets/images/book-cover.png";

interface DailyLessonModalProps {
  lesson: DailyLessonItem;
  color: Color;
  onClose: () => void;
}

const DailyLessonModal = ({
  lesson,
  color,
  onClose,
}: DailyLessonModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `অধ্যায় নং = ${lesson.chapterNumber}\n${lesson.class} | ${lesson.subject}\n\n${lesson.topics}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] backdrop-blur-2xl"
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[101] left-0 right-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6 bangla"
      >
        <div
          className="relative bg-[var(--color-bg)] rounded-t-2xl md:rounded-2xl w-full overflow-hidden"
          style={{
            maxHeight: "96dvh",
            boxShadow:
              "0 -8px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "96dvh",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Coloured header */}
            {/* Coloured header */}
            <div className="relative h-52 overflow-hidden">
              {/* Book cover image */}
              <img
                src={book}
                alt="cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${color.from}dd 0%, ${color.from}88 50%, transparent 100%)`,
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-all backdrop-blur-sm"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Text over image */}
              <div className="absolute bottom-0 left-0 px-6 pb-5">
                <p className="font-black text-2xl text-white drop-shadow-md">
                  {lesson.subject}
                </p>
                {lesson.teacher && (
                  <p className="text-white/75 text-sm mt-1">{lesson.teacher}</p>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-8 pt-5 flex flex-col gap-5">
              {/* Pill badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "🏫", value: lesson.class },
                  {
                    emoji: "📖",
                    value: `অধ্যায় ${toBn(lesson.chapterNumber)}`,
                  },
                  { emoji: "📅", value: lesson.date },
                ].map((item) => (
                  <span
                    key={item.value}
                    className="inline-flex items-center gap-2 text-sm md:text-base px-4 py-2 rounded-2xl font-semibold border"
                    style={{
                      background: `${color.from}0e`,
                      color: color.text,
                      borderColor: `${color.from}25`,
                    }}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.value}</span>
                  </span>
                ))}
              </div>

              <div
                className="h-px rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color.from}40, ${color.to}20, transparent)`,
                }}
              />

              {/* Topics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
                    }}
                  />
                  <p
                    className="text-sm font-black uppercase tracking-widest"
                    style={{ color: color.from }}
                  >
                    বিষয়বস্তু ও নির্দেশনা
                  </p>
                </div>
                <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-line">
                  {lesson.topics}
                </p>
              </div>

              <div className="h-px rounded-full bg-slate-100 dark:bg-slate-800" />

              {/* Footer */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-300 dark:text-slate-600">
                  কপি হবে: অধ্যায় নং · শ্রেণি · বিষয় · বিষয়বস্তু
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    aria-label={copied ? "কপি সম্পন্ন" : "কপি করুন"}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      copied
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default DailyLessonModal;
