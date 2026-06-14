// MCQExamCard.tsx
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Folder,
  Copy,
  Check,
} from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { formatBnDate } from "../../utility/Formatters";

/* ─────────────── Extract Examiner ─────────────── */
const extractExaminer = (postedBy: Exam["postedBy"]) => {
  if (!postedBy) return { name: "—", avatarUrl: null, role: null };

  const name = postedBy.name?.trim() || "—";
  let avatarUrl: string | null = null;

  if (
    typeof postedBy.avatar === "string" &&
    postedBy.avatar.startsWith("http")
  ) {
    avatarUrl = postedBy.avatar;
  }

  return { name, avatarUrl, role: postedBy.role || null };
};

/* ── Helper: Bengali day name (inline, no extra import needed) ── */
const BN_DAYS_FULL = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const getBnDayName = (dateStr: string) =>
  BN_DAYS_FULL[new Date(dateStr).getDay()];

const getExamDayLabel = (examDate: string) => {
  const exam = new Date(examDate);
  const today = new Date();

  exam.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = exam.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return {
      label: "আজকের পরীক্ষা",
      isToday: true,
      isTomorrow: false,
      isPast: false,
    };
  if (diffDays === 1)
    return {
      label: "আগামীকাল পরীক্ষা",
      isToday: false,
      isTomorrow: true,
      isPast: false,
    };
  if (diffDays < 0)
    return {
      label: getBnDayName(examDate),
      isToday: false,
      isTomorrow: false,
      isPast: true,
    };
  return {
    label: getBnDayName(examDate),
    isToday: false,
    isTomorrow: false,
    isPast: false,
  };
};

/* ─────────────── Build Copy Text ─────────────── */
const buildCopyText = (exam: Exam, examinerName: string): string => {
  return [
    `📋 ${exam.subject}`,
    `🎓 শ্রেণি: ${exam.studentClass}`,
    `📅 MCQ পরিক্ষার তারিখ: ${formatBnDate(exam.examDate)}`,
    `👤 শিক্ষকঃ ${examinerName}`,
    "",
    `📝 ${exam.subject} এর ${exam.description}`,
  ].join("\n");
};

/* ─────────────── Card Component ─────────────── */
export const MCQExamCard = ({
  exam,
  index,
  onClick,
}: {
  exam: Exam;
  index: number;
  onClick: () => void;
}) => {
  const { name: examinerName, avatarUrl } = extractExaminer(exam.postedBy);

  const {
    label: dayLabel,
    isToday,
    isTomorrow,
    isPast,
  } = getExamDayLabel(exam.examDate);

  const showPulse = isToday || isTomorrow || isPast;

  // ── Copy state ──
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (copied) return;

      const text = buildCopyText(exam, examinerName);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [exam, examinerName, copied],
  );

  return (
    <div className="" onClick={onClick}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.06,
          duration: 0.44,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group relative flex h-[250px] cursor-pointer flex-col overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] shadow-sm transition-all duration-300 bangla"
      >
        {/* ── Top gradient bar ── */}
        <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-hover)]" />

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-5">
          {/* ===== Avatar + Subject + Examiner ===== */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={examinerName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget
                      .nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "flex";
                  }}
                  className="h-12 w-12 rounded-full object-cover lg:h-14 lg:w-14"
                />
              ) : null}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-hover)] text-sm font-bold text-white shadow-sm"
                style={{ display: avatarUrl ? "none" : "flex" }}
              >
                {examinerName !== "—" ? (
                  examinerName.charAt(0).toUpperCase()
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-base font-extrabold leading-tight text-[var(--color-text)] sm:text-lg">
                {exam.subject}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-[var(--color-gray)]">
                <Folder className="h-3.5 w-3.5 shrink-0" />
                {examinerName}
              </p>
            </div>
          </div>

          {/* ===== Meta pills ===== */}
          <div className="flex flex-wrap gap-1.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-[var(--color-gray)]" />
              <span className="text-xs font-medium text-[var(--color-gray)]">
                {exam.studentClass}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[var(--color-gray)]">
              <Calendar className="h-3 w-3" />
              {formatBnDate(exam.examDate)}
            </span>
          </div>

          <div className="h-px rounded-full bg-[var(--color-active-border)]" />

          {/* ===== Description ===== */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-gray)]">
              {exam.description || "কোনো বিবরণ নেই"}
            </p>
          </div>

          {/* ===== Footer ===== */}
          <div className="mt-auto flex items-center justify-between">
            {/* ── Copy Button (Animated) ── */}
            <button
              onClick={handleCopy}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg 
                         transition-colors duration-200
                         hover:bg-[var(--color-active-border)]
                         active:scale-90"
              aria-label={copied ? "কপি হয়েছে" : "তথ্য কপি করুন"}
              title={copied ? "কপি হয়েছে!" : "তথ্য কপি করুন"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="flex items-center justify-center text-green-500"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0, rotate: 90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -90, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="flex items-center justify-center text-[var(--color-gray)]"
                  >
                    <Copy className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* ── Day Label ── */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.06 + 0.3, type: "spring" }}
              className={`flex items-center gap-1.5 ${
                isToday
                  ? "animate-pulse text-green-500"
                  : isTomorrow
                    ? "animate-pulse text-red-500"
                    : isPast
                      ? "animate-pulse text-amber-500"
                      : "text-[var(--color-gray)]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              {showPulse && (
                <span
                  className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                    isToday
                      ? "bg-green-500"
                      : isTomorrow
                        ? "bg-red-500"
                        : "bg-amber-500"
                  }`}
                />
              )}
              <span>{dayLabel}</span>
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
