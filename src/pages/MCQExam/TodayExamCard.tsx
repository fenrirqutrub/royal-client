import type { Exam } from "../../types/McqExam";
import { motion } from "framer-motion";
import { getStudentClassNumber } from "../../utility/constants/class";
import { formatBnDate, formatBnWeekday } from "../../utility/Formatters";

export const TodayExamCard = ({
  exam,
  onSelect,
}: {
  exam: Exam;
  onSelect: (e: Exam) => void;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.985 }}
    onClick={() => onSelect(exam)}
    className="group mb-3 w-full overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] text-left shadow-sm transition-all hover:shadow-md"
  >
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div className="flex h-16 min-w-[56px] shrink-0 items-center justify-center rounded bg-[var(--color-text)] px-2 shadow-sm">
          <span className="whitespace-nowrap text-sm font-bold leading-none text-[var(--color-bg)] lg:text-lg">
            {getStudentClassNumber(exam.studentClass)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="bangla text-lg font-bold leading-snug text-[var(--color-text)]">
            {exam.subject}
          </p>

          <p className="bangla mt-0.5 text-[11px] font-medium text-[var(--color-gray)]">
            {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
          </p>

          {exam.description?.trim() && (
            <p className="bangla mt-1 line-clamp-1 text-[11px] text-[var(--color-gray)]">
              {exam.description.trim()}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <div className="flex items-center justify-center gap-1.5 rounded-full border border-green-500 bg-[var(--color-active-bg)] px-5 py-0.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="bangla text-xs font-bold text-[var(--color-text)]">
            আজ
          </span>
        </div>
      </div>
    </div>
  </motion.button>
);
