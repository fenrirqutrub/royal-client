import type { Exam } from "../../types/McqExam";
import { getStudentClassNumber } from "../../utility/constants/class";
import { formatBnDate, formatBnWeekday, toBn } from "../../utility/Formatters";
import { motion } from "framer-motion";

const getDaysUntil = (examDate: string): number => {
  const now = new Date();
  const date = new Date(examDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.ceil(
    (examDay.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
};

export const UpcomingExamCard = ({
  exam,
  idx,
  onSelect,
}: {
  exam: Exam;
  idx: number;
  onSelect: (e: Exam) => void;
}) => {
  const days = getDaysUntil(exam.examDate);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.04 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(exam)}
      className="group flex w-full items-center gap-3.5 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] p-3.5 text-left transition-all hover:border-[var(--color-text)]/20 hover:bg-[var(--color-active-bg)] hover:shadow-sm"
    >
      {/* ── Class Number Box (আইকনের বদলে ক্লাস নাম্বার) ── */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
        <span className="bangla text-xl font-bold text-[var(--color-text)]">
          {getStudentClassNumber(exam.studentClass)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="bangla text-sm lg:text-lg font-bold text-[var(--color-text)]">
          {exam.subject}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="bangla text-[11px] text-[var(--color-gray)]">
            {formatBnDate(exam.examDate)}
          </span>
          <span className="text-[var(--color-active-border)]">·</span>
          <span className="bangla text-[11px] text-[var(--color-gray)]">
            {formatBnWeekday(exam.examDate)}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-5 py-1 text-xs font-bold text-[var(--color-text)]">
          {days === 1 ? "আগামীকাল" : ` আর মাত্র ${toBn(days)} দিন`}
        </span>
      </div>
    </motion.button>
  );
};
