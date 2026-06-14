// MCQExamCard.tsx - Compact version
import { motion } from "framer-motion";
import { Calendar, User, ChevronRight } from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { formatBnDate, formatBnWeekday } from "../../utility/Formatters";
import { getStudentClassNumber } from "../../utility/constants/class";

export const MCQExamCard = ({
  exam,
  index,
  onClick,
}: {
  exam: Exam;
  index: number;
  onClick: () => void;
}) => {
  const isToday =
    new Date(exam.examDate).toDateString() === new Date().toDateString();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-3 text-left transition-all hover:border-[var(--color-text)]/30 hover:shadow-md"
    >
      {isToday && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5"
        >
          <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
          <span className="bangla text-xs font-bold text-white">আজ</span>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-text)] text-sm font-bold text-[var(--color-bg)]">
          {getStudentClassNumber(exam.studentClass)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="bangla mb-1 text-sm font-bold text-[var(--color-text)]">
            {exam.subject}
          </p>

          <div className="flex items-center gap-2 text-xs text-[var(--color-gray)]">
            <Calendar size={10} />
            <span className="bangla">
              {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
            </span>
          </div>

          {exam.postedBy?.name && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-gray)]">
              <User size={10} />
              <span className="bangla truncate">{exam.postedBy.name}</span>
            </div>
          )}
        </div>

        <motion.div
          animate={{ x: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="shrink-0 text-[var(--color-gray)]"
        >
          <ChevronRight size={16} />
        </motion.div>
      </div>
    </motion.button>
  );
};
