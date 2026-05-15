// src/components/common/ExamPagination.tsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { toBn } from "../../utility/Formatters";

// ─── Props ────────────────────────────────────────────────
export interface ExamPaginationProps {
  examNumbers: string[];
  selected: string;
  onSelect: (examNumber: string) => void;
  hint?: string;
  windowSize?: number;
}

// ─── Component ────────────────────────────────────────────
const ExamPagination = ({
  examNumbers,
  selected,
  onSelect,
  hint,
  windowSize = 5,
}: ExamPaginationProps) => {
  const total = examNumbers.length;
  const selectedIndex = examNumbers.indexOf(selected);

  const visibleNumbers = useMemo(() => {
    if (total <= windowSize) return examNumbers;

    const start = Math.max(
      0,
      Math.min(selectedIndex - Math.floor(windowSize / 2), total - windowSize),
    );

    return examNumbers.slice(start, start + windowSize);
  }, [examNumbers, selectedIndex, total, windowSize]);

  if (total <= 1) return null;

  const arrowCls =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl " +
    "text-[var(--color-gray)] transition-all duration-200 " +
    "hover:bg-[var(--color-active-bg)] " +
    "hover:text-[var(--color-active-text)] " +
    "disabled:pointer-events-none disabled:opacity-30";

  return (
    <nav
      role="navigation"
      aria-label="পরীক্ষা নম্বর পেজিনেশন"
      className="mt-10 flex flex-col items-center gap-3"
    >
      <div className="flex items-center gap-1.5">
        {/* ← Prev */}
        <button
          onClick={() => onSelect(examNumbers[selectedIndex - 1])}
          disabled={selectedIndex === 0}
          aria-label="আগের পরীক্ষা"
          className={arrowCls}
        >
          <IoChevronBack className="h-5 w-5" />
        </button>

        {/* Exam number buttons */}
        {visibleNumbers.map((num) => {
          const isActive = num === selected;

          return (
            <motion.button
              key={num}
              onClick={() => onSelect(num)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              aria-label={`পরীক্ষা নং ${num}`}
              aria-current={isActive ? "page" : undefined}
              className={`h-10 min-w-[3rem] rounded-lg px-3 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "border border-[var(--color-active-border)] bg-[var(--color-text)] text-[var(--color-bg)] shadow-md"
                  : "text-[var(--color-gray)] hover:bg-[var(--color-active-bg)] hover:text-[var(--color-active-text)]"
              }`}
            >
              {toBn(num)}
            </motion.button>
          );
        })}

        {/* → Next */}
        <button
          onClick={() => onSelect(examNumbers[selectedIndex + 1])}
          disabled={selectedIndex === total - 1}
          aria-label="পরের পরীক্ষা"
          className={arrowCls}
        >
          <IoChevronForward className="h-5 w-5" />
        </button>
      </div>

      {hint && (
        <p className="tracking-wide text-xs text-[var(--color-gray)]">{hint}</p>
      )}
    </nav>
  );
};

export default ExamPagination;
