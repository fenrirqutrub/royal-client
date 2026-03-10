// DailyLessonCard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Calendar, BookOpen, Folder } from "lucide-react";

import { COLORS, toBn } from "../../utility/shared";
import DailyLessonModal from "./DailyLessonModal";

// ─── Types ────────────────────────────────────────────────
export interface DailyLessonItem {
  _id: string;
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  chapterNumber: string;
  topics: string;
  images: { url: string; public_id: string }[];
  date: string;
  createdAt: string;
  slug?: string;
}

interface DailyLessonCardProps {
  lesson: DailyLessonItem;
  index: number;
}

// ─── Component ────────────────────────────────────────────
const DailyLessonCard = ({ lesson, index }: DailyLessonCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const color = COLORS[index % COLORS.length];

  const handleCopy = () => {
    const text = `অধ্যায় নং = ${lesson.chapterNumber}\n${lesson.class} | ${lesson.subject}\n\n${lesson.topics}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.07,
          duration: 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group overflow-hidden rounded-2xl bg-[var(--color-bg)] text-[var(--color-text)] shadow-md shadow-slate-200/50 dark:shadow-black/40 border border-[var(--color-active-border)]/60 hover:shadow-xl hover:border-[var(--color-active-border)]/90 transition-all duration-300 bangla"
        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        {/* Top color accent bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
          }}
        />

        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <h3 className="text-xl md:text-2xl font-bold leading-tight bangla tracking-tight text-[var(--color-text)]">
                {lesson.subject}
              </h3>
              <div className="flex flex-wrap  items-center gap-x-4 gap-y-1.5 text-sm text-[var(--color-gray)]">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate ">{lesson.class}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate ">
                    অধ্যায় {toBn(lesson.chapterNumber)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate ">{lesson.teacher || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 bangla">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{lesson.date}</span>
                </div>
              </div>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              aria-label={copied ? "কপি সম্পন্ন" : "কপি করুন"}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                copied
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "text-slate-500 hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/8"
              }`}
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Topics preview */}
          <div className="relative bangla">
            <p className="text-[0.94rem] leading-relaxed text-[var(--color-gray)] line-clamp-4">
              {lesson.topics}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="absolute bottom-0 right-0 font-bold underline underline-offset-2 hover:opacity-75 transition-opacity duration-150 text-[0.94rem] leading-relaxed pl-1"
              style={{
                color: color.text,
                background: "var(--color-bg)",
              }}
            >
              ...বিস্তারিত
            </button>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <DailyLessonModal
          lesson={lesson}
          color={color}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default DailyLessonCard;
