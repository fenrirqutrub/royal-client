import { CheckCircle2, ChevronRight } from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { motion } from "framer-motion";
import { formatBnDate, formatBnWeekday } from "../../utility/Formatters";

export const PastExamRow = ({
  exam,
  onSelect,
}: {
  exam: Exam;
  onSelect: (e: Exam) => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(exam)}
    className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[var(--color-bg)]"
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)]">
      <CheckCircle2 size={15} className="text-[var(--color-gray)]" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="bangla text-[13px] font-medium text-[var(--color-text)]">
        {exam.subject}
      </p>
      <p className="bangla text-[11px] text-[var(--color-gray)]">
        {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
      </p>
    </div>

    <ChevronRight
      size={14}
      className="shrink-0 text-[var(--color-gray)] transition-transform duration-200 group-hover:translate-x-0.5"
    />
  </motion.button>
);
